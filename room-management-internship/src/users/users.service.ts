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
    if (currentUser.role === UserRole.USER) {
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
    if (currentUser.role === UserRole.USER && currentUser.id !== id) {
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
    if (currentUser.role === UserRole.USER && currentUser.id !== id) {
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
    if (currentUser.role === UserRole.USER) {
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
      updateData.approvedBy = currentUser.id;
      updateData.approvedAt = new Date();
      updateData.rejectedBy = null;
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    } else {
      updateData.approvedBy = null;
      updateData.approvedAt = null;
      updateData.rejectedBy = currentUser.id;
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
}
