import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApproveUserDto } from '../dto/approve-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: User) {
    // Only admins and super admins can view all users
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        isApproved: true,
        approvedBy: true,
        approvedAt: true,
        rejectedBy: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, currentUser: User) {
    // Users can only view their own profile, admins can view any profile
    if (currentUser.role === UserRole.EMPLOYEE && currentUser.id !== id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        isApproved: true,
        approvedBy: true,
        approvedAt: true,
        rejectedBy: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User) {
    // Only admins and super admins can update other users
    if (currentUser.role === UserRole.EMPLOYEE && currentUser.id !== id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Super admins can change roles, regular admins cannot
    if (updateUserDto.role && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can change user roles');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        isApproved: true,
        approvedBy: true,
        approvedAt: true,
        rejectedBy: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, currentUser: User) {
    // Only super admins can delete users
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete users');
    }

    // Prevent self-deletion
    if (currentUser.id === id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async deactivate(id: number, currentUser: User) {
    // Only admins and super admins can deactivate users
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Prevent self-deactivation
    if (currentUser.id === id) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        isApproved: true,
        approvedBy: true,
        approvedAt: true,
        rejectedBy: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getPendingUsers(currentUser: User) {
    // Only super admins can view pending users
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.user.findMany({
      where: {
        isApproved: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        isApproved: true,
        approvedBy: true,
        approvedAt: true,
        rejectedBy: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveUser(id: number, approveUserDto: ApproveUserDto, currentUser: User) {
    // Only super admins can approve/reject users
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Prevent self-approval
    if (currentUser.id === id) {
      throw new ForbiddenException('Cannot approve your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {
      isApproved: approveUserDto.isApproved,
    };

    if (approveUserDto.isApproved) {
      updateData.approvedById = currentUser.id;
      updateData.approvedAt = new Date();
      updateData.rejectedById = null;
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    } else {
      updateData.approvedById = null;
      updateData.approvedAt = null;
      updateData.rejectedById = currentUser.id;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = approveUserDto.rejectionReason;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        isApproved: true,
        approvedBy: true,
        approvedAt: true,
        rejectedBy: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUsersByDepartment(departmentId: number, currentUser: User) {
    // Only admins and department members can view department users
    if (currentUser.role === UserRole.EMPLOYEE && currentUser.departmentId !== departmentId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.user.findMany({
      where: { departmentId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        title: true,
        phone: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });
  }

  async getPendingApprovals() {
    return this.prisma.user.findMany({
      where: {
        isApproved: false,
        isActive: true,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getUserStats() {
    const stats = await this.prisma.user.groupBy({
      by: ['role', 'isApproved'],
      _count: {
        id: true,
      },
    });

    const total = await this.prisma.user.count();
    const active = await this.prisma.user.count({
      where: { isActive: true },
    });
    const approved = await this.prisma.user.count({
      where: { isApproved: true },
    });
    const pending = await this.prisma.user.count({
      where: { isApproved: false, isActive: true },
    });

    return {
      total,
      active,
      approved,
      pending,
      byRole: stats.reduce((acc, stat) => {
        const key = `${stat.role}_${stat.isApproved ? 'approved' : 'pending'}`;
        acc[key] = stat._count.id;
        return acc;
      }, {}),
    };
  }

  async updateUserDepartment(userId: number, departmentId: number, currentUser: User) {
    // Only admins can change user departments
    if (currentUser.role === UserRole.EMPLOYEE) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate department exists
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { departmentId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
