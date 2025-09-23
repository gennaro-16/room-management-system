import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ApproveBookingDto } from '../dto/approve-booking.dto';
import { ApproveUserDto } from '../dto/approve-user.dto';
import { ConflictsService } from '../conflicts/conflicts.service';
import { BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private conflictsService: ConflictsService,
  ) {}

  // Booking Approvals
  async approveBooking(bookingId: number, approverId: number, approveBookingDto: ApproveBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          select: {
            name: true,
            floor: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.status !== 'PENDING') {
      throw new ForbiddenException('Only pending bookings can be approved or rejected');
    }

    // Check for conflicts if approving
    if (approveBookingDto.status === 'APPROVED') {
      const conflictInfo = await this.conflictsService.checkBookingConflicts(
        booking.roomId,
        booking.startTime.toISOString(),
        booking.endTime.toISOString(),
        booking.id
      );

      if (conflictInfo.hasConflict) {
        // Find alternatives for the conflict
        const alternatives = await this.conflictsService.findAlternatives(
          booking.roomId,
          booking.startTime.toISOString(),
          booking.endTime.toISOString(),
          booking.expectedAttendees || 1,
          booking.id
        );

        throw new BadRequestException({
          message: 'Impossible to approve. Another booking is already approved in this room for that time.',
          conflictInfo,
          alternatives,
        });
      }
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    // Determine the appropriate status based on time
    let finalStatus = approveBookingDto.status;
    
    if (approveBookingDto.status === 'APPROVED') {
      // If booking time has passed, mark as COMPLETED
      if (endTime < now) {
        finalStatus = 'COMPLETED';
      }
      // If booking is currently ongoing, mark as ONGOING
      else if (startTime <= now && now <= endTime) {
        finalStatus = 'ONGOING';
      }
      // Otherwise, keep as APPROVED
    } else if (approveBookingDto.status === 'REJECTED') {
      // If booking time has passed, keep as REJECTED
      // If booking time hasn't passed yet, keep as REJECTED
      finalStatus = 'REJECTED';
    }

    const updateData: any = {
      status: finalStatus,
    };

    if (approveBookingDto.status === 'APPROVED') {
      updateData.approvedById = approverId;
      updateData.approvedAt = new Date();
    } else if (approveBookingDto.status === 'REJECTED') {
      updateData.rejectedById = approverId;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = approveBookingDto.rejectionReason;
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        organizer: true,
        room: true,
        approvedBy: true,
        rejectedBy: true,
      },
    });

    // Notifications disabled

    return updatedBooking;
  }

  async getUserApprovals(approverId: number) {
    return await this.prisma.booking.findMany({
      where: {
        OR: [
          { approvedById: approverId },
          { rejectedById: approverId },
        ],
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            floor: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getPendingApprovals(approverId: number) {
    return await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        // Only show bookings that the approver can approve based on their role
        OR: [
          // Super admin and admin can approve all
          {
            organizer: {
              role: {
                in: ['EMPLOYEE', 'GUEST'],
              },
            },
          },
          // Directors can approve bookings from their department
          {
            organizer: {
              department: {
                users: {
                  some: {
                    id: approverId,
                    role: {
                      in: ['EMPLOYEE'],
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            floor: true,
            capacity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // User Approvals
  async approveUser(userId: number, approverId: number, approveUserDto: ApproveUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.isApproved) {
      throw new ForbiddenException('User is already approved');
    }

    const updateData: any = {
      isApproved: approveUserDto.isApproved,
    };

    if (approveUserDto.isApproved) {
      updateData.approvedById = approverId;
      updateData.approvedAt = new Date();
    } else {
      updateData.rejectedById = approverId;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = approveUserDto.rejectionReason;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        department: true,
        approvedBy: true,
        rejectedBy: true,
      },
    });

    // Notifications disabled

    return updatedUser;
  }

  async getPendingUserApprovals() {
    return await this.prisma.user.findMany({
      where: {
        isApproved: false,
        isActive: true,
      },
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getApprovalStats(approverId: number) {
    const [bookingStats, userStats] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['status'],
        where: {
          OR: [
            { approvedById: approverId },
            { rejectedById: approverId },
          ],
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.user.groupBy({
        by: ['isApproved'],
        where: {
          OR: [
            { approvedById: approverId },
            { rejectedById: approverId },
          ],
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const pendingBookings = await this.prisma.booking.count({
      where: { status: 'PENDING' },
    });

    const pendingUsers = await this.prisma.user.count({
      where: { isApproved: false, isActive: true },
    });

    return {
      bookings: {
        pending: pendingBookings,
        approved: bookingStats.find(s => s.status === 'APPROVED')?._count.id || 0,
        rejected: bookingStats.find(s => s.status === 'REJECTED')?._count.id || 0,
      },
      users: {
        pending: pendingUsers,
        approved: userStats.find(s => s.isApproved === true)?._count.id || 0,
        rejected: userStats.find(s => s.isApproved === false)?._count.id || 0,
      },
    };
  }
}
