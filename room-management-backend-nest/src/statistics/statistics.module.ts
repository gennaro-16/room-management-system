import { Module } from '@nestjs/common';
import { VisitorStatisticsService } from './statistics.service';
import { VisitorStatisticsController } from './statistics.controller';

@Module({
  controllers: [VisitorStatisticsController],
  providers: [VisitorStatisticsService],
})
export class StatisticsModule {}
