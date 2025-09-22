import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      return await this.prisma.department.create({
        data: createDepartmentDto,
        include: {
          rooms: true,
          users: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Department name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.department.findMany({
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            capacity: true,
            floor: true,
            isUnderMaintenance: true,
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            capacity: true,
            floor: true,
            isUnderMaintenance: true,
            amenities: true,
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            role: true,
            isActive: true,
            isApproved: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            users: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      return await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
        include: {
          rooms: true,
          users: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Department name already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      if (error.code === 'P2003') {
        throw new ConflictException('Cannot delete department with associated rooms or users');
      }
      throw error;
    }
  }

  async getDepartmentStats(id: number) {
    const department = await this.findOne(id);
    
    const stats = await this.prisma.department.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            rooms: true,
            users: true,
          },
        },
        rooms: {
          select: {
            isUnderMaintenance: true,
            bookings: {
              where: {
                status: {
                  in: ['PENDING', 'APPROVED', 'ONGOING'],
                },
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const availableRooms = stats?.rooms?.filter(room => !room.isUnderMaintenance).length || 0;
    const maintenanceRooms = stats?.rooms?.filter(room => room.isUnderMaintenance).length || 0;
    const activeBookings = stats?.rooms?.reduce((acc, room) => acc + room.bookings.length, 0) || 0;

    return {
      ...department,
      stats: {
        totalRooms: stats?._count?.rooms || 0,
        availableRooms,
        maintenanceRooms,
        totalUsers: stats?._count?.users || 0,
        activeBookings,
      },
    };
  }
}
