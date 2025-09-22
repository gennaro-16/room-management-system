
import { Module } from '@nestjs/common';
import { VisitorService } from './visitors.service'
import { VisitorController } from './visitors.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { VisitService } from '../visits/visits.service';

@Module({
  controllers: [VisitorController],
  providers: [VisitorService, VisitService, PrismaService],
  exports: [VisitorService],
})
export class VisitorsModule {}