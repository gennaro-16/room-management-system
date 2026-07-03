import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitService {
  constructor(private prisma: PrismaService) {}
 async getFilters() {
    const [rooms, department] = await Promise.all([
       this.prisma.room.findMany({
      select: { name: true }}),
      this.prisma.department.findMany({ select: { name: true }
      }),]);

    return {
      rooms: rooms.map(r => r.name),
      departments: department.map(d => d.name),
    };
  }
async getVisits({
  page,
  limit,
  startDate,
  endDate,
  visitorName,
  room,
  department,
  status,
}) {
  const skip = (page - 1) * limit;
  const take = limit;

  const where: any = {};

  // ✅ Date range filter
  if (startDate && endDate) {
    where.checkedIn = {
      gte: new Date(startDate + 'T00:00:00Z'),
      lte: new Date(endDate + 'T23:59:59Z'),
    };
  } else if (startDate) {
    where.checkedIn = {
      gte: new Date(startDate + 'T00:00:00Z'),
    };
  } else if (endDate) {
    where.checkedIn = {
      lte: new Date(endDate + 'T23:59:59Z'),
    };
  }

  // ✅ Visitor filter
if (visitorName) {
  const terms = visitorName.split(" ").filter(Boolean);

  where.visitor = {
    AND: terms.map((term) => ({
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
      ],
    })),
  };
}


  // ✅ Booking filters
  if (room || department) {
    const roomConditions: any = {};

    if (room) {
      roomConditions.name = { contains: room, mode: 'insensitive' };
    }

    if (department) {
      roomConditions.department = {
        name: { contains: department, mode: 'insensitive' },
      };
    }

    where.booking = { room: roomConditions };
  }

  // ✅ Status filter
  if (status === 'isActive') {
    where.checkedOut = null;
  } else if (status === 'isCheckedOut') {
    where.checkedOut = { not: null };
  }

  // ✅ Query Prisma
  const [data, total] = await Promise.all([
    this.prisma.visit.findMany({
      where,
      skip,
      take,
      include: {
        visitor: true,
        booking: {
          include: {
            room: { include: { department: true } },
          },
        },
      },
      orderBy: { checkedIn: 'desc' },

    }),
    this.prisma.visit.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / take),
  };
}




  async create(dto: CreateVisitDto) {
    try {
      return await this.prisma.visit.create({
        data: {
          visitorId: dto.visitorId,
          bookingId: dto.bookingId,
          checkedIn: new Date(dto.checkedIn),
          checkedOut: dto.checkedOut ? new Date(dto.checkedOut) : null,
          purpose: dto.purpose,
        },
        include: {
          visitor: true,
          booking: { include: { room: { include: { department: true } } } },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        visitor: true,
        booking: { include: { room: { include: { department: true } } } },
      },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  async update(id: number, data: UpdateVisitDto) {
    try {
      return await this.prisma.visit.update({ where: { id }, data });
    } catch (error) {
      throw new NotFoundException('Visit not found');
    }
  }

  async checkout(id: number) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.checkedOut) throw new BadRequestException('Already checked out');
    return this.prisma.visit.update({
      where: { id },
      data: { checkedOut: new Date() },
    });
  }
}