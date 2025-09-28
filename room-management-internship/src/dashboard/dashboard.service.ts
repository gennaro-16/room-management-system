import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RoomStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const totalRooms = await this.prisma.room.count();
    const totalBookings = await this.prisma.booking.count();
    
    // Get active bookings (currently ongoing)
    const activeBookings = await this.prisma.booking.count({
      where: {
        status: BookingStatus.ONGOING,
        startTime: {
          lte: new Date()
        },
        endTime: {
          gte: new Date()
        }
      }
    });

    // Get rooms by status using the new status field
    const roomsByStatus = await this.prisma.room.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get available rooms (FREE status)
    const availableRooms = await this.prisma.room.count({
      where: {
        status: RoomStatus.FREE
      }
    });

    // Get rooms under maintenance
    const maintenanceRooms = await this.prisma.room.count({
      where: {
        status: RoomStatus.MAINTENANCE
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
      availableRooms,
      maintenanceRooms,
      roomsByStatus: roomsByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      bookingsByStatus: bookingsByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      }))
    };
  }

  async getRoomsSummary() {
    const rooms = await this.prisma.room.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        status: true,
        isUnderMaintenance: true
      },
      orderBy: { name: 'asc' }
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      status: room.status,
      isAvailable: room.status === RoomStatus.FREE
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
        organizer: true
      },
      orderBy: { startTime: 'asc' }
    });

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.APPROVED,
        startTime: {
          gte: new Date()
        }
      },
      include: {
        room: true,
        organizer: true
      },
      orderBy: { startTime: 'asc' },
      take: 10
    });

    return {
      todayBookings: todayBookings.map(booking => ({
        id: booking.id,
        user: booking.organizer?.firstName && booking.organizer?.lastName
          ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
          : booking.organizer?.username || 'Unknown User',
        room: booking.room.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        purpose: booking.purpose
      })),
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        user: booking.organizer?.firstName && booking.organizer?.lastName
          ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
          : booking.organizer?.username || 'Unknown User',
        room: booking.room.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        purpose: booking.purpose
      }))
    };
  }
}
