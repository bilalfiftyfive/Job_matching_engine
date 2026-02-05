import { Test, TestingModule } from '@nestjs/testing';
import { JobMatchingService } from './job-matching.service';

describe('JobMatchingService', () => {
  let service: JobMatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobMatchingService],
    }).compile();

    service = module.get<JobMatchingService>(JobMatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
