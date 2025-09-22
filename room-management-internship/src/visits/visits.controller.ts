import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { VisitService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Controller('visits')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}
 @Get('filters')
  async getFilters() {
    const filters = await this.visitService.getFilters();
    return filters; // { rooms: [...], departments: [...] }
  }
@Get()
async getVisits(
  @Query('page') page = '1',
  @Query('limit') limit = '8',
  @Query('date') date?: string,
  @Query('visitorName') visitorName?: string,
  @Query('room') room?: string,
  @Query('department') department?: string,
  @Query('status') status?: string, // 👈 added status query param
) {
  return this.visitService.getVisits({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    date,
    visitorName,
    room,
    department,
    status, // 👈 pass to service
  });
}



  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.visitService.create(dto);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.visitService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVisitDto) {
    return this.visitService.update(Number(id), dto);
  }

  @Patch(':id/checkout')
  checkout(@Param('id') id: string) {
    return this.visitService.checkout(Number(id));
  }
}