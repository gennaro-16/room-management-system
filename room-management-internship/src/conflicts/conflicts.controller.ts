import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConflictsService } from './conflicts.service';
import { EnhancedConflictsService } from './enhanced-conflicts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

export class ResolveConflictDto {
  alternativeRoomId: number;
  alternativeStartTime: string;
  alternativeEndTime: string;
}

export class ProcessConflictDto {
  roomId: number;
  startTime: string;
  endTime: string;
  requiredCapacity: number;
}

@Controller('conflicts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ConflictsController {
  constructor(
    private readonly conflictsService: ConflictsService,
    private readonly enhancedConflictsService: EnhancedConflictsService
  ) {}

  @Get('bookings')
  async getConflictingBookings() {
    return await this.conflictsService.getConflictingBookings();
  }

  @Get('check/:bookingId')
  async checkBookingConflicts(@Param('bookingId') bookingId: string) {
    const booking = await this.conflictsService['prisma'].booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { room: true, organizer: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const conflictInfo = await this.conflictsService.checkBookingConflicts(
      booking.roomId,
      booking.startTime.toISOString(),
      booking.endTime.toISOString(),
      booking.id
    );

    const alternatives = await this.conflictsService.findAlternatives(
      booking.roomId,
      booking.startTime.toISOString(),
      booking.endTime.toISOString(),
      booking.expectedAttendees || 1,
      booking.id
    );

    return {
      booking,
      conflictInfo,
      alternatives,
    };
  }

  @Post('resolve/:bookingId')
  async resolveConflict(
    @Param('bookingId') bookingId: string,
    @Body() resolveConflictDto: ResolveConflictDto,
    @CurrentUser() user: User
  ) {
    return await this.conflictsService.resolveConflict(
      parseInt(bookingId),
      resolveConflictDto.alternativeRoomId,
      resolveConflictDto.alternativeStartTime,
      resolveConflictDto.alternativeEndTime,
      user.id
    );
  }

  @Post('process')
  async processBookingConflict(
    @Body() processConflictDto: ProcessConflictDto
  ) {
    return await this.enhancedConflictsService.processBookingConflict(
      0, // temporary booking ID for processing
      processConflictDto.roomId,
      processConflictDto.startTime,
      processConflictDto.endTime,
      processConflictDto.requiredCapacity
    );
  }

  @Get('enhanced/:bookingId')
  async getEnhancedConflictAnalysis(@Param('bookingId') bookingId: string) {
    const booking = await this.conflictsService['prisma'].booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { room: true, organizer: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return await this.enhancedConflictsService.processBookingConflict(
      booking.id,
      booking.roomId,
      booking.startTime.toISOString(),
      booking.endTime.toISOString(),
      booking.expectedAttendees || 1
    );
  }

  @Get('alternatives')
  async findAlternatives(
    @Body() data: {
      roomId: number;
      startTime: string;
      endTime: string;
      requiredCapacity: number;
      excludeBookingId?: number;
    }
  ) {
    return await this.enhancedConflictsService.findComprehensiveAlternatives(
      data.roomId,
      data.startTime,
      data.endTime,
      data.requiredCapacity,
      data.excludeBookingId
    );
  }
}
