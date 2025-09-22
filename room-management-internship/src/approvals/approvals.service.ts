import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ApproveBookingDto } from '../dto/approve-booking.dto';
import { ApproveUserDto } from '../dto/approve-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
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

    const updateData: any = {
      status: approveBookingDto.status,
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

    // Send notification to booking organizer
    const notificationType = approveBookingDto.status === 'APPROVED' 
      ? 'BOOKING_APPROVED' 
      : 'BOOKING_REJECTED';
    
    const title = approveBookingDto.status === 'APPROVED' 
      ? 'Booking Approved' 
      : 'Booking Rejected';
    
    const message = approveBookingDto.status === 'APPROVED'
      ? `Your booking "${booking.title}" for room ${booking.room.name} has been approved.`
      : `Your booking "${booking.title}" for room ${booking.room.name} has been rejected. ${approveBookingDto.rejectionReason || ''}`;

    await this.notificationsService.createBookingNotification(
      booking.organizerId,
      notificationType as any,
      title,
      message,
      bookingId,
    );

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
                      in: ['DIRECTOR', 'SUB_DIRECTOR'],
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
        internalAttendees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    // Send notification to user
    const title = approveUserDto.isApproved ? 'Account Approved' : 'Account Rejected';
    const message = approveUserDto.isApproved
      ? `Your account has been approved. You can now access the room booking system.`
      : `Your account has been rejected. ${approveUserDto.rejectionReason || ''}`;

    await this.notificationsService.create({
      userId,
      title,
      message,
      type: approveUserDto.isApproved ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
    });

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
