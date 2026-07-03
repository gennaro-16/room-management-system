import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';
import { EnhancedConflictsService } from './enhanced-conflicts.service';

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingBookings: Array<{
    id: number;
    title: string;
    organizer: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  conflictReason?: string;
}

export interface AlternativeSuggestion {
  roomId: number;
  roomName: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  capacity: number;
  available: boolean;
  reason: 'same_time_different_room' | 'time_shift_same_room' | 'time_shift_different_room';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface ConflictResolutionResult {
  bookingId: number;
  status: 'APPROVED' | 'CONFLICT' | 'REJECTED';
  alternatives: AlternativeSuggestion[];
  conflictInfo?: ConflictInfo;
}

@Injectable()
export class ConflictsService {
  constructor(
    private prisma: PrismaService,
    private enhancedConflictsService: EnhancedConflictsService
  ) {}

  /**
   * Check for conflicts when approving a booking
   */
  async checkBookingConflicts(
    roomId: number,
    startTime: string,
    endTime: string,
    excludeBookingId?: number
  ): Promise<ConflictInfo> {
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        roomId,
        status: BookingStatus.APPROVED,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          // New booking starts during existing booking
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          // New booking ends during existing booking
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          // New booking completely contains existing booking
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
          // New booking is completely contained by existing booking
          {
            startTime: { lte: startTime },
            endTime: { gte: endTime },
          },
        ],
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    const hasConflict = conflictingBookings.length > 0;
    const conflictReason = hasConflict
      ? `Room is already booked by ${conflictingBookings[0].organizer.firstName || conflictingBookings[0].organizer.username} from ${conflictingBookings[0].startTime.toISOString()} to ${conflictingBookings[0].endTime.toISOString()}`
      : undefined;

    return {
      hasConflict,
      conflictingBookings: conflictingBookings.map(booking => ({
        id: booking.id,
        title: booking.title,
        organizer: booking.organizer.firstName && booking.organizer.lastName
          ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
          : booking.organizer.username,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        status: booking.status,
      })),
      conflictReason,
    };
  }

  /**
   * Find alternative room suggestions for a conflicted booking
   */
  async findAlternatives(
    originalRoomId: number,
    startTime: string,
    endTime: string,
    requiredCapacity: number,
    bookingId?: number
  ): Promise<AlternativeSuggestion[]> {
    const alternatives: AlternativeSuggestion[] = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();

    // Step A: Look for other rooms free at the same time
    const sameTimeAlternatives = await this.findRoomsAvailableAtTime(
      startTime,
      endTime,
      requiredCapacity,
      originalRoomId,
      bookingId
    );

    alternatives.push(...sameTimeAlternatives.map((room: any) => ({
      roomId: room.id,
      roomName: room.name,
      suggestedStartTime: startTime,
      suggestedEndTime: endTime,
      capacity: room.capacity,
      available: true,
      reason: 'same_time_different_room' as const,
      priority: 'high' as const,
      description: `Same time slot in ${room.name} (${room.capacity} capacity)`
    })));

    // Step B1: Try original room with ±30 minutes shift
    const timeShifts = [-30, 30, -60, 60]; // minutes
    for (const shift of timeShifts) {
      const shiftedStart = new Date(start.getTime() + shift * 60 * 1000);
      const shiftedEnd = new Date(end.getTime() + shift * 60 * 1000);
      
      // Check if shifted time is valid (not in the past)
      if (shiftedStart < new Date()) continue;

      const isOriginalRoomFree = await this.isRoomAvailableAtTime(
        originalRoomId,
        shiftedStart.toISOString(),
        shiftedEnd.toISOString(),
        bookingId
      );

      if (isOriginalRoomFree) {
        const room = await this.prisma.room.findUnique({ where: { id: originalRoomId } });
        const priority = Math.abs(shift) <= 30 ? 'high' : Math.abs(shift) <= 60 ? 'medium' : 'low';
        alternatives.push({
          roomId: originalRoomId,
          roomName: room?.name || 'Unknown Room',
          suggestedStartTime: shiftedStart.toISOString(),
          suggestedEndTime: shiftedEnd.toISOString(),
          capacity: room?.capacity || 0,
          available: true,
          reason: 'time_shift_same_room' as const,
          priority: priority as 'high' | 'medium' | 'low',
          description: `Same room, ${shift > 0 ? '+' : ''}${shift} minutes shift`
        });
      }
    }

    // Step B2: Try other rooms with ±30 minutes shift
    for (const shift of timeShifts) {
      const shiftedStart = new Date(start.getTime() + shift * 60 * 1000);
      const shiftedEnd = new Date(end.getTime() + shift * 60 * 1000);
      
      // Check if shifted time is valid (not in the past)
      if (shiftedStart < new Date()) continue;

      const shiftedAlternatives = await this.findRoomsAvailableAtTime(
        shiftedStart.toISOString(),
        shiftedEnd.toISOString(),
        requiredCapacity,
        originalRoomId,
        bookingId
      );

      const priority = Math.abs(shift) <= 30 ? 'high' : Math.abs(shift) <= 60 ? 'medium' : 'low';
      alternatives.push(...shiftedAlternatives.map((room: any) => ({
        roomId: room.id,
        roomName: room.name,
        suggestedStartTime: shiftedStart.toISOString(),
        suggestedEndTime: shiftedEnd.toISOString(),
        capacity: room.capacity,
        available: true,
        reason: 'time_shift_different_room' as const,
        priority: priority as 'high' | 'medium' | 'low',
        description: `${room.name}, ${shift > 0 ? '+' : ''}${shift} minutes shift (${room.capacity} capacity)`
      })));
    }

    // Remove duplicates and sort by preference
    const uniqueAlternatives = alternatives.filter((alt, index, self) => 
      index === self.findIndex(a => 
        a.roomId === alt.roomId && 
        a.suggestedStartTime === alt.suggestedStartTime
      )
    );

    return uniqueAlternatives.sort((a, b) => {
      // Prioritize same time over time shifts
      if (a.reason === 'same_time_different_room' && b.reason !== 'same_time_different_room') return -1;
      if (b.reason === 'same_time_different_room' && a.reason !== 'same_time_different_room') return 1;
      
      // Then prioritize same room over different room
      if (a.reason === 'time_shift_same_room' && b.reason === 'time_shift_different_room') return -1;
      if (b.reason === 'time_shift_different_room' && a.reason === 'time_shift_same_room') return 1;
      
      return 0;
    });
  }

  /**
   * Find rooms available at a specific time
   */
  private async findRoomsAvailableAtTime(
    startTime: string,
    endTime: string,
    requiredCapacity: number,
    excludeRoomId?: number,
    excludeBookingId?: number
  ): Promise<any[]> {
    const rooms = await this.prisma.room.findMany({
      where: {
        id: excludeRoomId ? { not: excludeRoomId } : undefined,
        capacity: { gte: requiredCapacity },
        isUnderMaintenance: false,
      },
    });

    const availableRooms: any[] = [];
    for (const room of rooms) {
      const isAvailable = await this.isRoomAvailableAtTime(
        room.id,
        startTime,
        endTime,
        excludeBookingId
      );
      
      if (isAvailable) {
        availableRooms.push(room);
      }
    }

    return availableRooms;
  }

  /**
   * Check if a room is available at a specific time
   */
  private async isRoomAvailableAtTime(
    roomId: number,
    startTime: string,
    endTime: string,
    excludeBookingId?: number
  ): Promise<boolean> {
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId,
        status: {
          in: [BookingStatus.APPROVED, BookingStatus.ONGOING]
        },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
          {
            startTime: { lte: startTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    return !conflictingBooking;
  }

  /**
   * Get all conflicting bookings for the conflicts page
   */
  async getConflictingBookings() {
    return await this.enhancedConflictsService.getConflictingBookings();
  }

  /**
   * Resolve a booking conflict by approving an alternative
   */
  async resolveConflict(
    bookingId: number,
    alternativeRoomId: number,
    alternativeStartTime: string,
    alternativeEndTime: string,
    approverId: number
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        organizer: true,
        room: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be resolved');
    }

    // Update the booking with the alternative
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        roomId: alternativeRoomId,
        startTime: alternativeStartTime,
        endTime: alternativeEndTime,
        status: BookingStatus.APPROVED,
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: {
        organizer: true,
        room: true,
        approvedBy: true,
      },
    });

    return updatedBooking;
  }
}
