import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

export interface CreateVisitorWithVisitDto {
  visitorId?: number; // existing visitor
  firstName?: string; // required if creating new visitor
  lastName?: string;  // required if creating new visitor
  email?: string;
  phone?: string;
  purpose?: string;
  bookingId?: number; // optional
}

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}
 async getVisitorWithVisits(id: number) {
  return this.prisma.visitor.findUnique({
    where: { id },
    include: {
      visits: {
        include: {
          booking: {
            include: {
              room: {
                include: {
                  department: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

  async create(data: CreateVisitorDto) {
    try {
      return await this.prisma.visitor.create({ data });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return this.prisma.visitor.findMany({
      include: { visits: { include: { booking: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: { visits: { include: { booking: true } } },
    });
    if (!visitor) throw new NotFoundException('Visitor not found');
    return visitor;
  }

  async update(id: number, data: UpdateVisitorDto) {
    try {
      return await this.prisma.visitor.update({ where: { id }, data });
    } catch (error) {
      throw new NotFoundException('Visitor not found');
    }
  }

  async createVisitorWithVisit(dto: CreateVisitorWithVisitDto) {
  try {
    let visitor;

    if (dto.visitorId) {
      visitor = await this.prisma.visitor.findUnique({ where: { id: dto.visitorId } });
      if (!visitor) throw new BadRequestException('Visitor not found');
    } else {
      if (!dto.firstName || !dto.lastName) {
        throw new BadRequestException('First name and last name required');
      }
      visitor = await this.prisma.visitor.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
        },
      });
    }

    const visit = await this.prisma.visit.create({
      data: {
        visitorId: visitor.id,
        checkedIn: new Date(),
        purpose: dto.purpose,
        bookingId: dto.bookingId ?? undefined,
      },
    });

    return { visitor, visit };
  } catch (err) {
    console.error('Error creating visitor with visit:', err);
    throw err; // rethrow so NestJS can return it
  }
}

}
