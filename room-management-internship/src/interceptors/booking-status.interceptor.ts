import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '@prisma/prisma.service';
import { BookingStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class BookingStatusInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async () => {
        // Run for booking and room-related endpoints
        const request = context.switchToHttp().getRequest();
        if (request.url.includes('/bookings') || 
            request.url.includes('/approvals') || 
            request.url.includes('/rooms') ||
            request.url.includes('/dashboard')) {
          try {
            await this.updateBookingStatuses();
            await this.updateRoomStatuses();
          } catch (error) {
            console.error('Error updating booking/room statuses:', error);
            // Don't fail the request if status update fails
          }
        }
      })
    );
  }

  private async updateBookingStatuses() {
    const now = new Date();

    // Update APPROVED bookings to ONGOING if current time is within interval
    await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.APPROVED,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      data: { status: BookingStatus.ONGOING },
    });

    // Update ONGOING bookings to COMPLETED if current time is past end time
    await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.ONGOING,
        endTime: { lt: now },
      },
      data: { status: BookingStatus.COMPLETED },
    });

    // Update APPROVED bookings to COMPLETED if current time is past end time
    // (to catch missed ONGOING transitions)
    await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.APPROVED,
        endTime: { lt: now },
      },
      data: { status: BookingStatus.COMPLETED },
    });
  }

  private async updateRoomStatuses() {
    const now = new Date();
    
    try {
      // Get all rooms with their bookings
      const rooms = await this.prisma.room.findMany({
        include: {
          bookings: {
            where: {
              status: {
                in: [BookingStatus.APPROVED, BookingStatus.ONGOING]
              },
              OR: [
                {
                  startTime: { lte: now },
                  endTime: { gte: now }
                }
              ]
            }
          }
        }
      });

      // Update room statuses based on bookings and maintenance status
      for (const room of rooms) {
        let newStatus: RoomStatus;
        
        if (room.isUnderMaintenance) {
          newStatus = RoomStatus.MAINTENANCE;
        } else if (room.bookings.length > 0) {
          // Check if there's an ongoing booking
          const hasOngoingBooking = room.bookings.some(booking =>
            booking.startTime <= now && booking.endTime >= now
          );
          newStatus = hasOngoingBooking ? RoomStatus.BUSY : RoomStatus.FREE;
        } else {
          newStatus = RoomStatus.FREE;
        }

        // Only update if status changed
        if (room.status !== newStatus) {
          await this.prisma.room.update({
            where: { id: room.id },
            data: { status: newStatus }
          });
          console.log(`🔄 Room ${room.name} status updated: ${room.status} → ${newStatus}`);
        }
      }
    } catch (error) {
      console.error('Error updating room statuses:', error);
    }
  }
}
