import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { ConflictsModule } from '../conflicts/conflicts.module';
import { BookingStatusInterceptor } from '../interceptors/booking-status.interceptor';

@Module({
  imports: [PrismaModule, ConflictsModule],
  controllers: [ApprovalsController],
  providers: [
    ApprovalsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: BookingStatusInterceptor,
    },
  ],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
