import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { MoveBookingDto } from '../dto/move-booking.dto';
import { User, UserRole, BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createBookingDto: CreateBookingDto, currentUser: User) {
    const { roomId, startTime, endTime, purpose, title, expectedAttendees, internalAttendees, externalAttendees, requiredAmenities, isRecurring, recurrenceRule, agenda } = createBookingDto;

    // Validate room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Check if room is under maintenance
    if (room.isUnderMaintenance) {
      throw new BadRequestException('Room is under maintenance and cannot be booked');
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    if (start < new Date()) {
      throw new BadRequestException('Cannot book rooms in the past');
    }

    // Check for conflicting approved bookings; if conflict, return user-facing error (no suggestions)
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId,
        status: BookingStatus.APPROVED,
        OR: [
          {
            startTime: {
              lt: end
            },
            endTime: {
              gt: start
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      throw new ConflictException('Room is already booked for this time period');
    }

    // Create the booking with APPROVED status (auto-approval)
    const booking = await this.prisma.booking.create({
      data: {
        roomId,
        title,
        organizerId: currentUser.id,
        startTime: start,
        endTime: end,
        purpose,
        agenda,
        expectedAttendees,
        internalAttendees: (internalAttendees || []) as any,
        externalAttendees: externalAttendees || [],
        requiredAmenities: requiredAmenities || [],
        isRecurring: isRecurring || false,
        recurrenceRule,
        status: BookingStatus.APPROVED,
        approvedById: currentUser.id, // Auto-approve by the organizer
        approvedAt: new Date(),
      },
      include: {
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      }
    });

    // Notifications disabled

    return booking;
  }

  async findAll(currentUser: User) {
    // Visibility rules: Everyone can see approved and ongoing bookings
    // Only pending bookings are restricted to the organizer
    const whereClause: any = {
      OR: [
        // Show approved and ongoing bookings to everyone
        { status: { in: ['APPROVED', 'ONGOING', 'COMPLETED'] } },
        // Show pending bookings only to the organizer
        { 
          AND: [
            { status: 'PENDING' },
            { organizerId: currentUser.id }
          ]
        },
        // Show cancelled and rejected bookings only to the organizer
        {
          AND: [
            { status: { in: ['CANCELLED', 'REJECTED'] } },
            { organizerId: currentUser.id }
          ]
        }
      ]
    };

    return this.prisma.booking.findMany({
      where: whereClause,
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });
  }

  async findPendingBookings(currentUser: User) {
    // Only admins can see pending bookings
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.booking.findMany({
      where: { status: BookingStatus.PENDING },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async approveBooking(id: number, currentUser: User) {
    // Only admins can approve bookings
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { room: true }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    // Check for conflicting approved bookings
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId: booking.roomId,
        status: BookingStatus.APPROVED,
        id: { not: id },
        OR: [
          {
            startTime: {
              lt: booking.endTime
            },
            endTime: {
              gt: booking.startTime
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      throw new ConflictException('Room is already booked for this time period');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.APPROVED,
        approvedById: currentUser.id,
        approvedAt: new Date(),
      },
      include: {
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });
  }

  async rejectBooking(id: number, rejectionReason: string, currentUser: User) {
    // Only admins can reject bookings
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.REJECTED,
        rejectedById: currentUser.id,
        rejectedAt: new Date(),
        rejectionReason,
      },
      include: {
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        rejectedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });
  }

  async findOne(id: number, currentUser: User) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        rejectedBy: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Users can only view their own bookings, admins can view any booking
    if (currentUser.role !== UserRole.ADMIN && booking.organizerId !== currentUser.id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, currentUser: User) {
    const existingBooking = await this.findOne(id, currentUser);

    // Check permissions based on user role and booking status
    const isAdminRole = currentUser.role === UserRole.ADMIN;
    const isOwner = existingBooking.organizerId === currentUser.id;
    
    if (currentUser.role === UserRole.EMPLOYEE) {
      // Employees can only update their own bookings
      if (!isOwner) {
        throw new ForbiddenException('Insufficient permissions');
      }
      if (existingBooking.status === BookingStatus.REJECTED || existingBooking.status === BookingStatus.CANCELLED || existingBooking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Cannot update rejected, cancelled, or completed bookings');
      }
      // Keep bookings as APPROVED when updated (no re-approval needed)
      if (existingBooking.status === BookingStatus.APPROVED) {
        // Remove status from update to keep it APPROVED
        delete updateBookingDto.status;
      } else {
        // For other statuses, keep them as APPROVED for auto-approval system
        if (updateBookingDto.status && updateBookingDto.status !== BookingStatus.APPROVED) {
          updateBookingDto.status = BookingStatus.APPROVED;
        }
      }
    } else if (isAdminRole) {
      // Admins, Super Admins, and Directors can update approved bookings
      if (existingBooking.status === BookingStatus.REJECTED || existingBooking.status === BookingStatus.CANCELLED || existingBooking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Cannot update rejected, cancelled, or completed bookings');
      }
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Validate room/time changes similar to create()
    const newStart = updateBookingDto.startTime ? new Date(updateBookingDto.startTime) : existingBooking.startTime;
    const newEnd = updateBookingDto.endTime ? new Date(updateBookingDto.endTime) : existingBooking.endTime;
    if (newStart >= newEnd) {
      throw new BadRequestException('End time must be after start time');
    }

    const targetRoomId = typeof updateBookingDto.roomId === 'number' ? updateBookingDto.roomId : existingBooking.roomId;
    const targetRoom = await this.prisma.room.findUnique({ where: { id: targetRoomId } });
    if (!targetRoom) {
      throw new NotFoundException(`Room with ID ${targetRoomId} not found`);
    }
    if (targetRoom.isUnderMaintenance) {
      throw new BadRequestException('Room is under maintenance and cannot be booked');
    }

    // Check conflicts in target room, excluding current booking
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId: targetRoomId,
        id: { not: id },
        status: BookingStatus.APPROVED,
        OR: [
          {
            startTime: { lt: newEnd },
            endTime: { gt: newStart },
          },
        ],
      },
    });
    if (conflictingBooking) {
      throw new ConflictException('Room is already booked for this time period');
    }

    // Transform the DTO to match Prisma's expected format
    const updateData: any = { ...updateBookingDto };
    // Ensure computed values are applied if not supplied
    updateData.startTime = newStart;
    updateData.endTime = newEnd;
    updateData.roomId = targetRoomId;

    // Keep bookings as APPROVED even when employees modify key scheduling attributes (auto-approval)
    const changedRoom = targetRoomId !== existingBooking.roomId;
    const changedTime = newStart.getTime() !== existingBooking.startTime.getTime() || newEnd.getTime() !== existingBooking.endTime.getTime();
    if (currentUser.role === UserRole.EMPLOYEE && (changedRoom || changedTime)) {
      updateData.status = BookingStatus.APPROVED;
      updateData.approvedById = currentUser.id; // Auto-approve by the organizer
      updateData.approvedAt = new Date();
      updateData.rejectedById = null;
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      }
    });
  }

  async cancel(id: number, currentUser: User) {
    const booking = await this.findOne(id, currentUser);

    // Only users can cancel their own bookings, or admins can cancel any booking
    if (currentUser.role !== UserRole.ADMIN && booking.organizerId !== currentUser.id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Only pending and approved bookings can be cancelled
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Only pending or approved bookings can be cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      }
    });
  }

  async getBookingsByRoom(roomId: number, currentUser: User) {
    // Validate room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return this.prisma.booking.findMany({
      where: { roomId },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date, currentUser: User, organizerId?: number) {
    // Visibility rules mirror findAll: Everyone can see approved and ongoing bookings
    const whereClause: any = {
      AND: [
        { startTime: { gte: startDate } },
        { endTime: { lte: endDate } },
        {
          OR: [
            // Show approved and ongoing bookings to everyone
            { status: { in: ['APPROVED', 'ONGOING', 'COMPLETED'] } },
            // Show pending bookings only to the organizer
            { 
              AND: [
                { status: 'PENDING' },
                { organizerId: currentUser.id }
              ]
            },
            // Show cancelled and rejected bookings only to the organizer
            {
              AND: [
                { status: { in: ['CANCELLED', 'REJECTED'] } },
                { organizerId: currentUser.id }
              ]
            }
          ]
        }
      ]
    };

    // Add organizer filter if specified
    if (organizerId) {
      whereClause.AND.push({ organizerId });
    }

    return this.prisma.booking.findMany({
      where: whereClause,
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getApprovedBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.APPROVED,
        endTime: {
          gte: new Date()
        }
      },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getUpcomingBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.APPROVED,
        startTime: {
          gte: new Date()
        }
      },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async completeBooking(id: number, currentUser: User) {
    const booking = await this.findOne(id, currentUser);

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Only approved bookings can be completed');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.COMPLETED },
      include: { 
        room: true,
        organizer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        }
      }
    });
  }

  async moveBooking(id: number, dto: MoveBookingDto, currentUser: User) {
    const existing = await this.findOne(id, currentUser);

    // Permission checks: similar to update
    const isAdminRole = currentUser.role === UserRole.ADMIN;
    const isOwner = existing.organizerId === currentUser.id;

    if (currentUser.role === UserRole.EMPLOYEE && !isOwner) {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (existing.status === BookingStatus.REJECTED || existing.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot move rejected or cancelled bookings');
    }

    // Resolve new times
    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Validate new room
    const newRoom = await this.prisma.room.findUnique({ where: { id: dto.newRoomId } });
    if (!newRoom) {
      throw new NotFoundException(`Room with ID ${dto.newRoomId} not found`);
    }
    if (newRoom.isUnderMaintenance) {
      throw new BadRequestException('Room is under maintenance and cannot be booked');
    }

    // Check conflict in new room (exclude current booking)
    const conflicting = await this.prisma.booking.findFirst({
      where: {
        roomId: dto.newRoomId,
        id: { not: id },
        status: BookingStatus.APPROVED,
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          },
        ],
      },
    });
    if (conflicting) {
      throw new ConflictException('Room is already booked for this time period');
    }

    // Transaction: create new booking (pending), cancel old
    const result = await this.prisma.$transaction(async (tx) => {
      const moved = await tx.booking.create({
        data: {
          roomId: dto.newRoomId,
          title: existing.title,
          organizerId: existing.organizerId,
          startTime: start,
          endTime: end,
          purpose: existing.purpose,
          agenda: existing.agenda || undefined,
          expectedAttendees: existing.expectedAttendees,
          internalAttendees: existing.internalAttendees as any,
          externalAttendees: existing.externalAttendees as any,
          requiredAmenities: existing.requiredAmenities as any,
          isRecurring: existing.isRecurring,
          recurrenceRule: existing.recurrenceRule || undefined,
          status: BookingStatus.APPROVED,
          approvedById: currentUser.id, // Auto-approve by the organizer
          approvedAt: new Date(),
        },
        include: { room: true },
      });

      await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      });

      return moved;
    });

    // Notifications disabled

    return result;
  }
}
