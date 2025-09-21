import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingStatusCronService {
  private readonly logger = new Logger(BookingStatusCronService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs every minute to check and update booking statuses
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updateBookingStatuses() {
    this.logger.debug('Running booking status update cron job...');
    
    const now = new Date();
    
    try {
      // Update APPROVED bookings to ONGOING if current time is within booking interval
      const ongoingResult = await this.prisma.booking.updateMany({
        where: {
          status: BookingStatus.APPROVED,
          startTime: {
            lte: now, // start time is in the past or now
          },
          endTime: {
            gte: now, // end time is in the future or now
          },
        },
        data: {
          status: BookingStatus.ONGOING,
        },
      });

      // Update ONGOING bookings to COMPLETED if current time is past end time
      const ongoingToCompletedResult = await this.prisma.booking.updateMany({
        where: {
          status: BookingStatus.ONGOING,
          endTime: {
            lt: now, // end time is in the past
          },
        },
        data: {
          status: BookingStatus.COMPLETED,
        },
      });

      // Update APPROVED bookings to COMPLETED if current time is past end time
      // (This handles bookings that were approved but never became ONGOING)
      const approvedToCompletedResult = await this.prisma.booking.updateMany({
        where: {
          status: BookingStatus.APPROVED,
          endTime: {
            lt: now, // end time is in the past
          },
        },
        data: {
          status: BookingStatus.COMPLETED,
        },
      });

      if (ongoingResult.count > 0) {
        this.logger.log(`Updated ${ongoingResult.count} bookings to ONGOING status`);
      }
      
      if (ongoingToCompletedResult.count > 0) {
        this.logger.log(`Updated ${ongoingToCompletedResult.count} ONGOING bookings to COMPLETED status`);
      }

      if (approvedToCompletedResult.count > 0) {
        this.logger.log(`Updated ${approvedToCompletedResult.count} APPROVED bookings to COMPLETED status`);
      }

    } catch (error) {
      this.logger.error('Error updating booking statuses:', error);
    }
  }

  /**
   * Manual trigger for testing purposes
   */
  async triggerStatusUpdate() {
    this.logger.log('Manually triggering booking status update...');
    await this.updateBookingStatuses();
  }
}
