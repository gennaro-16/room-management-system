import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { mockPrismaProvider } from '../../test/mocks/prisma.mock';

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService, mockPrismaProvider],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
