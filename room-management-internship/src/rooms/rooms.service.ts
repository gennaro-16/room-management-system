import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { User, UserRole, BookingStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto, currentUser: User) {
    // Only admins can create rooms
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Check if room name already exists
    const existingRoom = await this.prisma.room.findUnique({
      where: { name: createRoomDto.name }
    });

    if (existingRoom) {
      throw new BadRequestException('Room with this name already exists');
    }

    return this.prisma.room.create({
      data: createRoomDto,
    });
  }

  async findAll() {
    const rooms = await this.prisma.room.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        description: true,
        amenities: true,
        floor: true,
        // building: true, // Excluded from response
        x: true,
        y: true,
        width: true,
        height: true,
        departmentId: true,
        department: true,
        isUnderMaintenance: true,
        maintenanceNotes: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          where: {
            status: BookingStatus.APPROVED,
            startTime: {
              lte: new Date()
            },
            endTime: {
              gte: new Date()
            }
          },
          include: {
            organizer: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                department: true,
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add availability status to each room
    return rooms.map(room => ({
      ...room,
      isAvailable: !room.isUnderMaintenance && room.bookings.length === 0,
      currentBooking: room.bookings.length > 0 ? room.bookings[0] : null,
    }));
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        capacity: true,
        description: true,
        amenities: true,
        floor: true,
        // building: true, // Excluded from response
        x: true,
        y: true,
        width: true,
        height: true,
        departmentId: true,
        department: true,
        isUnderMaintenance: true,
        maintenanceNotes: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          where: {
            status: BookingStatus.APPROVED,
            OR: [
              {
                startTime: {
                  lte: new Date()
                },
                endTime: {
                  gte: new Date()
                }
              }
            ]
          }
        }
      }
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return {
      ...room,
      isAvailable: !room.isUnderMaintenance && room.bookings.length === 0,
    };
  }

  async update(id: number, updateRoomDto: UpdateRoomDto, currentUser: User) {
    // Only admins can update rooms
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const existingRoom = await this.findOne(id);

    // If updating name, check for duplicates
    if (updateRoomDto.name && updateRoomDto.name !== existingRoom.name) {
      const duplicateRoom = await this.prisma.room.findUnique({
        where: { name: updateRoomDto.name }
      });

      if (duplicateRoom) {
        throw new BadRequestException('Room with this name already exists');
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async remove(id: number, currentUser: User) {
    // Only admins can delete rooms
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.findOne(id);

    // Check if room has approved bookings
    const approvedBookings = await this.prisma.booking.count({
      where: {
        roomId: id,
        status: BookingStatus.APPROVED,
        endTime: {
          gte: new Date()
        }
      }
    });

    if (approvedBookings > 0) {
      throw new BadRequestException('Cannot delete room with approved bookings');
    }

    return this.prisma.room.delete({
      where: { id },
    });
  }

  async toggleMaintenance(id: number, currentUser: User) {
    // Only admins can toggle maintenance status
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const room = await this.findOne(id);

    return this.prisma.room.update({
      where: { id },
      data: { isUnderMaintenance: !room.isUnderMaintenance },
    });
  }

  async getAvailableRooms(startTime: Date, endTime: Date) {
    // Find rooms that don't have conflicting approved bookings
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.APPROVED,
        OR: [
          {
            startTime: {
              lt: endTime
            },
            endTime: {
              gt: startTime
            }
          }
        ]
      },
      select: {
        roomId: true
      }
    });

    const conflictingRoomIds = conflictingBookings.map(booking => booking.roomId);

    return this.prisma.room.findMany({
      where: {
        id: {
          notIn: conflictingRoomIds
        },
        isUnderMaintenance: false
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        description: true,
        amenities: true,
        floor: true,
        // building: true, // Excluded from response
        x: true,
        y: true,
        width: true,
        height: true,
        departmentId: true,
        department: true,
        isUnderMaintenance: true,
        maintenanceNotes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { name: 'asc' }
      ]
    });
  }

  async getRoomAvailability(roomId: number, startTime: Date, endTime: Date) {
    const room = await this.findOne(roomId);

    if (room.isUnderMaintenance) {
      return {
        isAvailable: false,
        reason: 'Room is under maintenance'
      };
    }

    // Check for conflicting approved bookings
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId,
        status: BookingStatus.APPROVED,
        OR: [
          {
            startTime: {
              lt: endTime
            },
            endTime: {
              gt: startTime
            }
          }
        ]
      },
      include: {
        organizer: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (conflictingBooking) {
      return {
        isAvailable: false,
        reason: 'Room is already booked for this time period',
        conflictingBooking
      };
    }

    return {
      isAvailable: true,
      reason: 'Room is available'
    };
  }
}
