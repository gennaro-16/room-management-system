import { Test, TestingModule } from '@nestjs/testing';
import { VisitorStatisticsService } from './statistics.service';
import { mockPrismaProvider } from '../../test/mocks/prisma.mock';

describe('VisitorStatisticsService', () => {
  let service: VisitorStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitorStatisticsService, mockPrismaProvider],
    }).compile();

    service = module.get<VisitorStatisticsService>(VisitorStatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
