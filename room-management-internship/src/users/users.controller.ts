import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApproveUserDto } from '../dto/approve-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(@CurrentUser() user: User) {
    return this.usersService.findAll(user);
  }

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN)
  getPendingUsers(@CurrentUser() user: User) {
    return this.usersService.getPendingUsers(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.usersService.remove(id, user);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.usersService.deactivate(id, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.SUPER_ADMIN)
  approveUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveUserDto: ApproveUserDto,
    @CurrentUser() user: User
  ) {
    return this.usersService.approveUser(id, approveUserDto, user);
  }
}
