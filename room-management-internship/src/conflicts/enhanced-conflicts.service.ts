import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';

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
  rejectionReason?: string;
}

@Injectable()
export class EnhancedConflictsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Comprehensive conflict resolution with solution suggestions
   * This is the main middleware that processes all booking conflicts
   */
  async processBookingConflict(
    bookingId: number,
    roomId: number,
    startTime: string,
    endTime: string,
    requiredCapacity: number
  ): Promise<ConflictResolutionResult> {
    console.log(`🔄 Processing conflict for booking ${bookingId}`);
    
    // Step 1: Check for conflicts
    const conflictInfo = await this.checkBookingConflicts(roomId, startTime, endTime, bookingId);
    
    if (!conflictInfo.hasConflict) {
      return {
        bookingId,
        status: 'APPROVED',
        alternatives: []
      };
    }

    // Step 2: Search for solutions
    console.log('🔍 Searching for alternative solutions...');
    const alternatives = await this.findComprehensiveAlternatives(
      roomId,
      startTime,
      endTime,
      requiredCapacity,
      bookingId
    );

    // Step 3: Build results
    if (alternatives.length > 0) {
      console.log(`✅ Found ${alternatives.length} alternative solutions`);
      return {
        bookingId,
        status: 'CONFLICT',
        alternatives,
        conflictInfo
      };
    } else {
      console.log('❌ No suitable alternatives found - marking for rejection');
      return {
        bookingId,
        status: 'REJECTED',
        alternatives: [],
        conflictInfo,
        rejectionReason: 'No suitable room or time available'
      };
    }
  }

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
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ],
        ...(excludeBookingId && { id: { not: excludeBookingId } })
      },
      include: {
        organizer: true
      }
    });

    const conflictReason = conflictingBookings.length > 0 
      ? `Room is already booked by ${conflictingBookings.length} other approved booking(s)`
      : undefined;

    return {
      hasConflict: conflictingBookings.length > 0,
      conflictingBookings: conflictingBookings.map(booking => ({
        id: booking.id,
        title: booking.purpose || 'Meeting',
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
   * Comprehensive alternative search system
   * Implements the full solution suggestion workflow
   */
  async findComprehensiveAlternatives(
    originalRoomId: number,
    startTime: string,
    endTime: string,
    requiredCapacity: number,
    bookingId?: number
  ): Promise<AlternativeSuggestion[]> {
    const alternatives: AlternativeSuggestion[] = [];
    const start = new Date(startTime);
    const end = new Date(endTime);

    console.log(`🔍 Comprehensive search for booking ${bookingId || 'new'}`);
    console.log(`📅 Original: ${startTime} - ${endTime}`);
    console.log(`🏢 Room: ${originalRoomId}, Capacity: ${requiredCapacity}`);

    // Step A: Search Other Rooms (Same Time Slot)
    console.log('Step A: Searching other rooms for same time slot...');
    const sameTimeAlternatives = await this.findRoomsAvailableAtTime(
      startTime,
      endTime,
      requiredCapacity,
      originalRoomId,
      bookingId
    );
    
    sameTimeAlternatives.forEach((room: any) => {
      alternatives.push({
        roomId: room.id,
        roomName: room.name,
        suggestedStartTime: startTime,
        suggestedEndTime: endTime,
        capacity: room.capacity,
        available: true,
        reason: 'same_time_different_room',
        priority: 'high',
        description: `Same time slot in ${room.name} (${room.capacity} capacity)`
      });
    });

    // Step B1: Search Nearby Slots - Same Room First
    console.log('Step B1: Searching nearby time slots for same room...');
    const timeShifts = [-30, 30, -60, 60, -90, 90]; // minutes
    for (const shift of timeShifts) {
      const shiftedStart = new Date(start.getTime() + shift * 60 * 1000);
      const shiftedEnd = new Date(end.getTime() + shift * 60 * 1000);
      
      // Don't suggest past times
      if (shiftedStart < new Date()) continue;
      
      const isAvailable = await this.isRoomAvailableAtTime(
        originalRoomId,
        shiftedStart.toISOString(),
        shiftedEnd.toISOString(),
        bookingId
      );
      
      if (isAvailable) {
        const priority = Math.abs(shift) <= 30 ? 'high' : Math.abs(shift) <= 60 ? 'medium' : 'low';
        const room = await this.prisma.room.findUnique({ where: { id: originalRoomId } });
        alternatives.push({
          roomId: originalRoomId,
          roomName: room?.name || 'Unknown Room',
          suggestedStartTime: shiftedStart.toISOString(),
          suggestedEndTime: shiftedEnd.toISOString(),
          capacity: room?.capacity || 0,
          available: true,
          reason: 'time_shift_same_room',
          priority,
          description: `Same room, ${shift > 0 ? '+' : ''}${shift} minutes shift`
        });
      }
    }

    // Step B2: Search Other Rooms with Time Shifts
    console.log('Step B2: Searching other rooms with time shifts...');
    for (const shift of timeShifts) {
      const shiftedStart = new Date(start.getTime() + shift * 60 * 1000);
      const shiftedEnd = new Date(end.getTime() + shift * 60 * 1000);
      
      // Don't suggest past times
      if (shiftedStart < new Date()) continue;
      
      const shiftedAlternatives = await this.findRoomsAvailableAtTime(
        shiftedStart.toISOString(),
        shiftedEnd.toISOString(),
        requiredCapacity,
        originalRoomId,
        bookingId
      );
      
      shiftedAlternatives.forEach((room: any) => {
        const priority = Math.abs(shift) <= 30 ? 'high' : Math.abs(shift) <= 60 ? 'medium' : 'low';
        alternatives.push({
          roomId: room.id,
          roomName: room.name,
          suggestedStartTime: shiftedStart.toISOString(),
          suggestedEndTime: shiftedEnd.toISOString(),
          capacity: room.capacity,
          available: true,
          reason: 'time_shift_different_room',
          priority,
          description: `${room.name}, ${shift > 0 ? '+' : ''}${shift} minutes shift (${room.capacity} capacity)`
        });
      });
    }

    // Remove duplicates
    const uniqueAlternatives = alternatives.filter((alt, index, self) => 
      index === self.findIndex(a => 
        a.roomId === alt.roomId && 
        a.suggestedStartTime === alt.suggestedStartTime
      )
    );

    // Sort by priority and reason
    uniqueAlternatives.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      const reasonOrder = { 'same_time_different_room': 0, 'time_shift_same_room': 1, 'time_shift_different_room': 2 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return reasonOrder[a.reason] - reasonOrder[b.reason];
    });

    console.log(`✅ Found ${uniqueAlternatives.length} unique alternatives`);
    return uniqueAlternatives;
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
        capacity: { gte: requiredCapacity },
        ...(excludeRoomId && { id: { not: excludeRoomId } })
      }
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
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        roomId,
        status: BookingStatus.APPROVED,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ],
        ...(excludeBookingId && { id: { not: excludeBookingId } })
      }
    });

    return conflictingBookings.length === 0;
  }

  /**
   * Get all conflicting bookings for the secretary dashboard
   */
  async getConflictingBookings(): Promise<{
    conflictingBookings: any[];
    rejectedBookings: any[];
  }> {
    // Get all pending bookings
    const pendingBookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.PENDING },
      include: {
        organizer: true,
        room: true
      }
    });

    const conflictingBookings: any[] = [];
    const rejectedBookings: any[] = [];

    for (const booking of pendingBookings) {
      const conflictResult = await this.processBookingConflict(
        booking.id,
        booking.roomId,
        booking.startTime.toISOString(),
        booking.endTime.toISOString(),
        booking.expectedAttendees || 1
      );

      if (conflictResult.status === 'CONFLICT') {
        conflictingBookings.push({
          ...booking,
          conflictInfo: conflictResult.conflictInfo,
          alternatives: conflictResult.alternatives
        });
      } else if (conflictResult.status === 'REJECTED') {
        rejectedBookings.push({
          ...booking,
          conflictInfo: conflictResult.conflictInfo,
          rejectionReason: conflictResult.rejectionReason
        });
      }
    }

    return { conflictingBookings, rejectedBookings };
  }

  /**
   * Resolve a conflict by approving a suggested alternative
   */
  async resolveConflict(
    bookingId: number,
    alternative: AlternativeSuggestion,
    approverId: number
  ): Promise<any> {
    // Update the booking with the alternative
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        roomId: alternative.roomId,
        startTime: new Date(alternative.suggestedStartTime),
        endTime: new Date(alternative.suggestedEndTime),
        status: BookingStatus.APPROVED,
        approvedById: approverId,
        approvedAt: new Date()
      },
      include: {
        organizer: true,
        room: true,
        approvedBy: true
      }
    });

    return updatedBooking;
  }
}
