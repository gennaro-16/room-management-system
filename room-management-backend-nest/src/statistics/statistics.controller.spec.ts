import { Test, TestingModule } from '@nestjs/testing';
import { VisitorStatisticsController } from './statistics.controller';
import { VisitorStatisticsService } from './statistics.service';

describe('VisitorStatisticsController', () => {
  let controller: VisitorStatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitorStatisticsController],
      providers: [{ provide: VisitorStatisticsService, useValue: {} }],
    }).compile();

    controller = module.get<VisitorStatisticsController>(
      VisitorStatisticsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
