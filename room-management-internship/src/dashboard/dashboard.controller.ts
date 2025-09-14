import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('rooms-summary')
  getRoomsSummary() {
    return this.dashboardService.getRoomsSummary();
  }

  @Get('bookings-summary')
  getBookingsSummary() {
    return this.dashboardService.getBookingsSummary();
  }
}
