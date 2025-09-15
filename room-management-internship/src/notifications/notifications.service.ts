import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        relatedBooking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(userId?: number) {
    const where = userId ? { userId } : {};
    
    return await this.prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        relatedBooking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: number, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return await this.prisma.notification.findMany({
      where,
      include: {
        relatedBooking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            room: {
              select: {
                id: true,
                name: true,
                floor: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        relatedBooking: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            room: {
              select: {
                id: true,
                name: true,
                floor: true,
              },
            },
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    try {
      return await this.prisma.notification.update({
        where: { id },
        data: updateNotificationDto,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          relatedBooking: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }
      throw error;
    }
  }

  async markAsRead(id: number) {
    return await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.notification.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getUnreadCount(userId: number) {
    return await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async getNotificationStats(userId: number) {
    const stats = await this.prisma.notification.groupBy({
      by: ['type', 'isRead'],
      where: { userId },
      _count: {
        id: true,
      },
    });

    const total = await this.prisma.notification.count({
      where: { userId },
    });

    const unread = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      total,
      unread,
      read: total - unread,
      byType: stats.reduce((acc, stat) => {
        const key = `${stat.type}_${stat.isRead ? 'read' : 'unread'}`;
        acc[key] = stat._count.id;
        return acc;
      }, {}),
    };
  }

  // Helper method to create booking-related notifications
  async createBookingNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    bookingId?: number,
  ) {
    return await this.create({
      userId,
      title,
      message,
      type,
      relatedBookingId: bookingId,
    });
  }

  // Helper method to notify approvers about new booking requests
  async notifyApprovers(bookingId: number, bookingTitle: string) {
    // Get all users who can approve bookings (ADMIN, DIRECTOR, SUB_DIRECTOR)
    const approvers = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'DIRECTOR', 'SUB_DIRECTOR'],
        },
        isActive: true,
      },
      select: { id: true },
    });

    // Create notifications for all approvers
    const notifications = approvers.map(approver =>
      this.createBookingNotification(
        approver.id,
        NotificationType.NEW_BOOKING_REQUEST,
        'New Booking Request',
        `A new booking request "${bookingTitle}" requires your approval.`,
        bookingId,
      ),
    );

    return await Promise.all(notifications);
  }
}
