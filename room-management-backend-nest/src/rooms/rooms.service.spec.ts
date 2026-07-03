import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { mockPrismaProvider } from '../../test/mocks/prisma.mock';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, mockPrismaProvider],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
