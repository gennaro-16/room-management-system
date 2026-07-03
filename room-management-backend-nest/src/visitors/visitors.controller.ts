import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body,
  ParseIntPipe, 
  NotFoundException, 
  UseGuards 
} from '@nestjs/common';
import type { CreateVisitorWithVisitDto } from './visitors.service';
import { VisitorService } from './visitors.service';
import { VisitService } from '../visits/visits.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { CreateVisitDto } from '../visits/dto/create-visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('visitors')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Require authentication + roles
@Roles(UserRole.ADMIN)               // ✅ Restrict everything to ADMIN only
export class VisitorController {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly visitService: VisitService,
  ) {}

  // Create visitor with first visit
  @Post('visit')
  async createVisitorWithVisit(@Body() dto: CreateVisitorWithVisitDto) {
    const result = await this.visitorService.createVisitorWithVisit(dto);
    return {
      message: 'Visitor and visit created successfully',
      visitor: result.visitor,
      visit: result.visit,
    };
  }

  @Get()
  getAll() {
    return this.visitorService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.visitorService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateVisitorDto) {
    return this.visitorService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVisitorDto) {
    return this.visitorService.update(Number(id), dto);
  }

  @Post(':id/visits')
  createVisit(@Param('id') visitorId: string, @Body() dto: CreateVisitDto) {
    return this.visitService.create({
      ...dto,
      visitorId: Number(visitorId),
    });
  }

  @Patch('visits/:id/checkout')
  checkout(@Param('id') visitId: string) {
    return this.visitService.checkout(Number(visitId));
  }

  @Get(':id/visits')
  async getVisitsOfVisitor(@Param('id', ParseIntPipe) id: number) {
    const visitor = await this.visitorService.getVisitorWithVisits(id);
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    return visitor;
  }
}
