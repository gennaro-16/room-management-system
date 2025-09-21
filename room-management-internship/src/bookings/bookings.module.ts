import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaModule } from '@prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingStatusInterceptor } from '../interceptors/booking-status.interceptor';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: BookingStatusInterceptor,
    },
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
