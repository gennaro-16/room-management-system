import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PrismaModule } from '@prisma/prisma.module';
import { BookingStatusInterceptor } from '../interceptors/booking-status.interceptor';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController],
  providers: [
    RoomsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: BookingStatusInterceptor,
    },
  ],
  exports: [RoomsService],
})
export class RoomsModule {}
