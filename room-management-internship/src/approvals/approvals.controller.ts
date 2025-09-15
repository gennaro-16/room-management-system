import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApproveBookingDto } from '../dto/approve-booking.dto';
import { ApproveUserDto } from '../dto/approve-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  // Booking Approvals
  @Post('bookings/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.SUB_DIRECTOR)
  approveBooking(
    @Param('id', ParseIntPipe) bookingId: number,
    @Body() approveBookingDto: ApproveBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.approvalsService.approveBooking(bookingId, user.id, approveBookingDto);
  }

  @Get('bookings/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.SUB_DIRECTOR)
  getPendingBookings(@CurrentUser() user: User) {
    return this.approvalsService.getPendingApprovals(user.id);
  }

  @Get('bookings/my-approvals')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.SUB_DIRECTOR)
  getMyBookingApprovals(@CurrentUser() user: User) {
    return this.approvalsService.getUserApprovals(user.id);
  }

  // User Approvals
  @Post('users/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  approveUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() approveUserDto: ApproveUserDto,
    @CurrentUser() user: User,
  ) {
    return this.approvalsService.approveUser(userId, user.id, approveUserDto);
  }

  @Get('users/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getPendingUsers() {
    return this.approvalsService.getPendingUserApprovals();
  }

  // Stats
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.SUB_DIRECTOR)
  getApprovalStats(@CurrentUser() user: User) {
    return this.approvalsService.getApprovalStats(user.id);
  }
}
