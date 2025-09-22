import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Assuming you have a Prisma service
import { CreateVisitorDto, UpdateVisitorDto, FilterVisitorsDto, CreateVisitForVisitorDto } from '../visitors/dto/visitors.dto';
import { Visitor, Visit } from '@prisma/client';

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitorDto: CreateVisitorDto): Promise<Visitor> {
    return this.prisma.visitor.create({ data: createVisitorDto });
  }

  async findAll(query: FilterVisitorsDto): Promise<{ data: Visitor[]; total: number }> {
    const { date, status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    const include: any = {
      visits: {
        include: {
          booking: {
            include: {
              organizer: { select: { firstName: true, lastName: true } },
              room: { select: { name: true } },
            },
          },
        },
        orderBy: { checkedIn: 'desc' }, // Order visits for consistent display
      },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (date || status) {
      // Filter visitors based on their visits
      const visitWhere: any = {};
      if (date) {
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1); // Start of next day in UTC

        visitWhere.checkedIn = {
          gte: targetDate.toISOString(),
          lt: nextDay.toISOString(),
        };
      }

      if (status === 'active') {
        visitWhere.checkedOut = null;
      } else if (status === 'checkedout') {
        visitWhere.checkedOut = { not: null };
      }

      // Important: Link the visitor filter to visits
      // We need to find visitors who have at least one visit matching the criteria
      where.visits = {
        some: visitWhere,
      };
    }

    const [visitors, total] = await this.prisma.$transaction([
      this.prisma.visitor.findMany({
        where,
        include,
        skip,
        take: limit,
      }),
      this.prisma.visitor.count({ where }), // Count based on the same filters
    ]);

    // If filtering by date or status, ensure only relevant visits are included in the result.
    // Prisma's `include` does not filter its nested records directly.
    // So, we post-process the visits array for each visitor to match the visitWhere.
    const processedVisitors = visitors.map(visitor => {
        const filteredVisits = visitor.visits.filter(visit => {
            let matchesDate = true;
            let matchesStatus = true;

            if (date) {
                const visitCheckedIn = new Date(visit.checkedIn);
                const targetDate = new Date(date);
                matchesDate = visitCheckedIn.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
            }

            if (status === 'active') {
                matchesStatus = visit.checkedOut === null;
            } else if (status === 'checkedout') {
                matchesStatus = visit.checkedOut !== null;
            }

            return matchesDate && matchesStatus;
        });

        // Only return visitors who still have matching visits after this post-processing
        if (filteredVisits.length > 0) {
            return { ...visitor, visits: filteredVisits };
        }
        return null; // Filter out visitors with no matching visits after this
    }).filter(Boolean); // Remove null entries

    // Adjust total count if post-processing significantly changed the list
    // For robust pagination, the initial count should be accurate to the filtering.
    // If post-processing leads to fewer visitors than "total", the pagination might be off.
    // A more complex query might be needed if exact count after deep filtering is required.
    // For now, let's return the count before post-processing and rely on the frontend for visual consistency.
    return { data: processedVisitors as Visitor[], total };
  }


  async findOne(id: number): Promise<Visitor | null> {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: {
        visits: {
          include: {
            booking: {
              include: {
                organizer: { select: { firstName: true, lastName: true } },
                room: { select: { name: true } },
              },
            },
          },
          orderBy: { checkedIn: 'desc' }, // Order history
        },
      },
    });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    return visitor;
  }

  async update(id: number, updateVisitorDto: UpdateVisitorDto): Promise<Visitor> {
    const visitor = await this.prisma.visitor.findUnique({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    return this.prisma.visitor.update({
      where: { id },
      data: updateVisitorDto,
    });
  }

  async remove(id: number): Promise<void> {
    const visitor = await this.prisma.visitor.findUnique({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    await this.prisma.visitor.delete({ where: { id } });
  }

  async createVisitForVisitor(visitorId: number, createVisitDto: CreateVisitForVisitorDto): Promise<Visit> {
    const visitor = await this.prisma.visitor.findUnique({ where: { id: visitorId } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${visitorId} not found`);
    }
    // Also check if bookingId exists
    const booking = await this.prisma.booking.findUnique({ where: { id: createVisitDto.bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${createVisitDto.bookingId} not found`);
    }

    return this.prisma.visit.create({
      data: {
        visitorId,
        checkedIn: new Date(createVisitDto.checkedIn), // Ensure date object
        purpose: createVisitDto.purpose,
        bookingId: createVisitDto.bookingId,
      },
      include: { // Include related data for the frontend to display immediately
        visitor: { select: { firstName: true, lastName: true } },
        booking: {
          include: {
            organizer: { select: { firstName: true, lastName: true } },
            room: { select: { name: true } },
          },
        },
      },
    });
  }

  async checkoutVisit(visitId: number): Promise<Visit> {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }
    return this.prisma.visit.update({
      where: { id: visitId },
      data: { checkedOut: new Date() },
      include: { // Include related data for the frontend to display immediately
        visitor: { select: { firstName: true, lastName: true } },
        booking: {
          include: {
            organizer: { select: { firstName: true, lastName: true } },
            room: { select: { name: true } },
          },
        },
      },
    });
  }
}