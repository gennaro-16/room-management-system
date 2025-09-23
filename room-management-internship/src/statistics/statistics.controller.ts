import { Controller, Get, Query,UseGuards } from '@nestjs/common';
import { VisitorStatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('statistics')
export class VisitorStatisticsController {
  constructor(private readonly statsService: VisitorStatisticsService) {}

  @Get('visitors')
  async getVisitorStatistics(
    @Query('timeRange') timeRange: 'day' | 'month' | 'year' | undefined,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getStatistics(timeRange || 'month', startDate, endDate);
  }
}
