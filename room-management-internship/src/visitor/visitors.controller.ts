import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto, UpdateVisitorDto, FilterVisitorsDto, CreateVisitForVisitorDto } from '../visitors/dto/visitors.dto'; // Ensure these DTOs are correctly defined
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new visitor' })
  @ApiResponse({ status: 201, description: 'The visitor has been successfully created.' })
  async create(@Body() createVisitorDto: CreateVisitorDto) {
    return this.visitorsService.create(createVisitorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all visitors with optional filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of visitors.' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Filter visits by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'checkedout', 'all'], description: 'Filter visits by status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by visitor first/last name' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 10 })
  async findAll(@Query() query: FilterVisitorsDto) {
    return this.visitorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a visitor by ID' })
  @ApiResponse({ status: 200, description: 'The visitor found.' })
  @ApiResponse({ status: 404, description: 'Visitor not found.' })
  async findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a visitor by ID' })
  @ApiResponse({ status: 200, description: 'The visitor has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Visitor not found.' })
  async update(@Param('id') id: string, @Body() updateVisitorDto: UpdateVisitorDto) {
    return this.visitorsService.update(+id, updateVisitorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a visitor by ID' })
  @ApiResponse({ status: 204, description: 'The visitor has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Visitor not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.visitorsService.remove(+id);
  }

  // New endpoint for adding a visit to an existing visitor
  @Post(':visitorId/visits')
  @ApiOperation({ summary: 'Add a new visit for an existing visitor' })
  @ApiResponse({ status: 201, description: 'The visit has been successfully created.' })
  async createVisitForVisitor(
    @Param('visitorId') visitorId: string,
    @Body() createVisitDto: CreateVisitForVisitorDto,
  ) {
    return this.visitorsService.createVisitForVisitor(+visitorId, createVisitDto);
  }
}

@ApiTags('visits') // Separate controller for visit-specific actions, or merge into VisitorsController for simplicity
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitorsService: VisitorsService) {} // Reusing VisitorsService for now

  @Post(':id/checkout')
  @ApiOperation({ summary: 'Checkout a specific visit' })
  @ApiResponse({ status: 200, description: 'The visit has been successfully checked out.' })
  @ApiResponse({ status: 404, description: 'Visit not found.' })
  async checkout(@Param('id') id: string) {
    return this.visitorsService.checkoutVisit(+id);
  }
}