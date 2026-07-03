import { Module } from '@nestjs/common';
import { VisitorService } from './visitors.service'
import { VisitorController } from './visitors.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [VisitorController],
  providers: [VisitorService, PrismaService],
  exports: [VisitorService],
})
export class VisitorModule {}