import { Test, TestingModule } from '@nestjs/testing';
import { VisitorService } from './visitors.service';
import { mockPrismaProvider } from '../../test/mocks/prisma.mock';

describe('VisitorService', () => {
  let service: VisitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitorService, mockPrismaProvider],
    }).compile();

    service = module.get<VisitorService>(VisitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
