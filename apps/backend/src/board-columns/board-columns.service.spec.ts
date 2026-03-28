import { Test, TestingModule } from '@nestjs/testing';
import { BoardColumnsService } from '@/board-columns/board-columns.service';

describe('BoardColumnsService', () => {
  let service: BoardColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardColumnsService],
    }).compile();

    service = module.get<BoardColumnsService>(BoardColumnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
