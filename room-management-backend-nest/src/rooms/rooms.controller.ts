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
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UserRole } from '@prisma/client';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body(ValidationPipe) createRoomDto: CreateRoomDto,
    @CurrentUser() user: User
  ) {
    return this.roomsService.create(createRoomDto, user);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('available')
  getAvailableRooms(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }
    return this.roomsService.getAvailableRooms(
      new Date(startTime),
      new Date(endTime)
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Get(':id/availability')
  getRoomAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }
    return this.roomsService.getRoomAvailability(
      id,
      new Date(startTime),
      new Date(endTime)
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: User
  ) {
    return this.roomsService.update(id, updateRoomDto, user);
  }

  @Patch(':id/maintenance')
  @Roles(UserRole.ADMIN)
  toggleMaintenance(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.roomsService.toggleMaintenance(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.roomsService.remove(id, user);
  }
}
