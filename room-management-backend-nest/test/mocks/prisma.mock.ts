import { PrismaService } from '../../prisma/prisma.service';

/** Lightweight Prisma mock for unit tests (providers only need to resolve). */
export const mockPrismaService: Record<string, unknown> = {};

export const mockPrismaProvider = {
  provide: PrismaService,
  useValue: mockPrismaService,
};
