import { Module } from '@nestjs/common';
import { VisitService } from './visits.service';
import { VisitController } from './visits.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { VisitorsModule } from '../visitors/visitors.module';

@Module({
  imports: [VisitorsModule],
  controllers: [VisitController],
  providers: [VisitService, PrismaService],
  exports: [VisitService],
})
export class VisitModule {}