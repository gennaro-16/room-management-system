import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  Query,
  ValidationPipe,
  UseGuards
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createBookingDto: CreateBookingDto,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.create(createBookingDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('roomId') roomId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('organizerId') organizerId?: string
  ) {
    if (roomId) {
      return this.bookingsService.getBookingsByRoom(parseInt(roomId), user);
    }
    if (startDate && endDate) {
      return this.bookingsService.getBookingsByDateRange(
        new Date(startDate),
        new Date(endDate),
        user,
        organizerId ? parseInt(organizerId) : undefined
      );
    }
    if (status === 'approved') {
      return this.bookingsService.getApprovedBookings();
    }
    if (status === 'upcoming') {
      return this.bookingsService.getUpcomingBookings();
    }
    if (status === 'pending') {
      return this.bookingsService.findPendingBookings(user);
    }
    return this.bookingsService.findAll(user);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findPendingBookings(@CurrentUser() user: User) {
    return this.bookingsService.findPendingBookings(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DIRECTOR)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.update(id, updateBookingDto, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.approveBooking(id, user);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('rejectionReason') rejectionReason: string,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.rejectBooking(id, rejectionReason, user);
  }

  @Patch(':id/complete')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.completeBooking(id, user);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.bookingsService.cancel(id, user);
  }
}
