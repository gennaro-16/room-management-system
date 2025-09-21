import { Module } from '@nestjs/common';
import { BookingStatusCronService } from './booking-status-cron.service';
import { CronController } from './cron.controller';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CronController],
  providers: [BookingStatusCronService],
  exports: [BookingStatusCronService],
})
export class CronModule {}
