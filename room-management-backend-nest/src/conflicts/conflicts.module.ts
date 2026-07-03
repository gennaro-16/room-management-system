import { Module } from '@nestjs/common';
import { ConflictsService } from './conflicts.service';
import { ConflictsController } from './conflicts.controller';
import { EnhancedConflictsService } from './enhanced-conflicts.service';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConflictsController],
  providers: [ConflictsService, EnhancedConflictsService],
  exports: [ConflictsService, EnhancedConflictsService],
})
export class ConflictsModule {}
