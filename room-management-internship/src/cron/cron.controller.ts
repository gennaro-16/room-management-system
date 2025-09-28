import { Controller, Post, UseGuards } from '@nestjs/common';
import { BookingStatusCronService } from './booking-status-cron.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('cron')
export class CronController {
  constructor(private readonly bookingStatusCronService: BookingStatusCronService) {}

  @Post('trigger-booking-status-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async triggerBookingStatusUpdate() {
    await this.bookingStatusCronService.triggerStatusUpdate();
    return { message: 'Booking status update triggered successfully' };
  }

  @Post('trigger-room-status-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async triggerRoomStatusUpdate() {
    await this.bookingStatusCronService.updateRoomStatuses();
    return { message: 'Room status update triggered successfully' };
  }
}
