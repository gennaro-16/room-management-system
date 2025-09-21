import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '@prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingStatusInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async () => {
        // Only run for booking-related endpoints
        const request = context.switchToHttp().getRequest();
        if (request.url.includes('/bookings') || request.url.includes('/approvals')) {
          try {
            await this.updateBookingStatuses();
          } catch (error) {
            console.error('Error updating booking statuses:', error);
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
}
