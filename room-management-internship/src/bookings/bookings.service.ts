import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { User, UserRole, BookingStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
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

    // Check for conflicting approved bookings
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

    // Create the booking with PENDING status
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
        internalAttendees: internalAttendees ? {
          connect: internalAttendees.map(id => ({ id }))
        } : undefined,
        externalAttendees: externalAttendees || [],
        requiredAmenities: requiredAmenities || [],
        isRecurring: isRecurring || false,
        recurrenceRule,
        status: BookingStatus.PENDING,
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

    // Send notification to approvers about new booking request
    try {
      await this.notificationsService.notifyApprovers(booking.id, booking.title);
    } catch (error) {
      console.error('Failed to send notification to approvers:', error);
      // Don't fail the booking creation if notification fails
    }

    return booking;
  }

  async findAll(currentUser: User) {
    // Admins can see all bookings, users can only see their own
    const whereClause = currentUser.role === UserRole.EMPLOYEE 
      ? { organizerId: currentUser.id }
      : {};

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
    if (currentUser.role === UserRole.EMPLOYEE) {
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
    if (currentUser.role === UserRole.EMPLOYEE) {
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
    if (currentUser.role === UserRole.EMPLOYEE) {
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
    if (currentUser.role === UserRole.EMPLOYEE && booking.organizerId !== currentUser.id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, currentUser: User) {
    const existingBooking = await this.findOne(id, currentUser);

    // Check permissions based on user role and booking status
    const isAdminRole = currentUser.role === UserRole.ADMIN || 
                       currentUser.role === UserRole.SUPER_ADMIN || 
                       currentUser.role === UserRole.DIRECTOR;
    const isOwner = existingBooking.organizerId === currentUser.id;
    
    if (currentUser.role === UserRole.EMPLOYEE) {
      // Employees can only update their own pending bookings
      if (!isOwner) {
        throw new ForbiddenException('Insufficient permissions');
      }
      if (existingBooking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Only pending bookings can be updated');
      }
    } else if (isAdminRole) {
      // Admins, Super Admins, and Directors can update approved bookings
      if (existingBooking.status === BookingStatus.REJECTED || existingBooking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Cannot update rejected or cancelled bookings');
      }
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }

    // If updating time, check for conflicts
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const startTime = updateBookingDto.startTime ? new Date(updateBookingDto.startTime) : existingBooking.startTime;
      const endTime = updateBookingDto.endTime ? new Date(updateBookingDto.endTime) : existingBooking.endTime;

      if (startTime >= endTime) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check for conflicting approved bookings (excluding current booking)
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          roomId: existingBooking.roomId,
          id: { not: id },
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
        }
      });

      if (conflictingBooking) {
        throw new ConflictException('Room is already booked for this time period');
      }
    }

    // Transform the DTO to match Prisma's expected format
    const updateData: any = { ...updateBookingDto };
    
    // Handle internal attendees connection
    if (updateData.internalAttendees) {
      updateData.internalAttendees = {
        set: updateData.internalAttendees.map(id => ({ id }))
      };
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
    if (currentUser.role === UserRole.EMPLOYEE && booking.organizerId !== currentUser.id) {
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
    // Users can only see their own bookings in date range
    const whereClause = currentUser.role === UserRole.EMPLOYEE 
      ? { 
          organizerId: currentUser.id,
          startTime: { gte: startDate },
          endTime: { lte: endDate }
        }
      : {
          startTime: { gte: startDate },
          endTime: { lte: endDate },
          ...(organizerId && { organizerId })
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
}
