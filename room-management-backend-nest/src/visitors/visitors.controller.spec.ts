import { Test, TestingModule } from '@nestjs/testing';
import { VisitorController } from './visitors.controller';
import { VisitorService } from './visitors.service';
import { VisitService } from '../visits/visits.service';

describe('VisitorController', () => {
  let controller: VisitorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitorController],
      providers: [
        { provide: VisitorService, useValue: {} },
        { provide: VisitService, useValue: {} },
      ],
    }).compile();

    controller = module.get<VisitorController>(VisitorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
