import { Test, TestingModule } from '@nestjs/testing';
import { VisitController } from './visits.controller';
import { VisitService } from './visits.service';

describe('VisitController', () => {
  let controller: VisitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitController],
      providers: [{ provide: VisitService, useValue: {} }],
    }).compile();

    controller = module.get<VisitController>(VisitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
