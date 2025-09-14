import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const totalRooms = await this.prisma.room.count();
    const totalBookings = await this.prisma.booking.count();
    const activeBookings = await this.prisma.booking.count({
      where: {
        status: 'APPROVED',
        endTime: {
          gte: new Date()
        }
      }
    });

    // Get rooms by maintenance status
    const roomsByMaintenance = await this.prisma.room.groupBy({
      by: ['isUnderMaintenance'],
      _count: {
        isUnderMaintenance: true
      }
    });

    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return {
      totalRooms,
      totalBookings,
      activeBookings,
      roomsByStatus: roomsByMaintenance.map(item => ({
        status: item.isUnderMaintenance ? 'MAINTENANCE' : 'AVAILABLE',
        count: item._count.isUnderMaintenance
      })),
      bookingsByStatus: bookingsByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      }))
    };
  }

  async getRoomsSummary() {
    const rooms = await this.prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: 'APPROVED',
            startTime: {
              lte: new Date()
            },
            endTime: {
              gte: new Date()
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      status: room.isUnderMaintenance ? 'MAINTENANCE' : 'AVAILABLE',
      currentBookings: room.bookings.length,
      isAvailable: !room.isUnderMaintenance && room.bookings.length === 0
    }));
  }

  async getBookingsSummary() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayBookings = await this.prisma.booking.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        room: true,
        user: true
      },
      orderBy: { startTime: 'asc' }
    });

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        status: 'APPROVED',
        startTime: {
          gte: new Date()
        }
      },
      include: {
        room: true,
        user: true
      },
      orderBy: { startTime: 'asc' },
      take: 10
    });

    return {
      todayBookings: todayBookings.map(booking => ({
        id: booking.id,
        user: booking.user?.firstName && booking.user?.lastName 
          ? `${booking.user.firstName} ${booking.user.lastName}`
          : booking.user?.username || 'Unknown User',
        room: booking.room.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        purpose: booking.purpose
      })),
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        user: booking.user?.firstName && booking.user?.lastName 
          ? `${booking.user.firstName} ${booking.user.lastName}`
          : booking.user?.username || 'Unknown User',
        room: booking.room.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        purpose: booking.purpose
      }))
    };
  }
}
