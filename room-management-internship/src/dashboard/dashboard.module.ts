import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '@prisma/prisma.module';
import { BookingStatusInterceptor } from '../interceptors/booking-status.interceptor';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    {
      provide: APP_INTERCEPTOR,
      useClass: BookingStatusInterceptor,
    },
  ],
})
export class DashboardModule {}
