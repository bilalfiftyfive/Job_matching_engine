// matching/scoring/location.strategy.ts
import { Injectable } from '@nestjs/common';
import type { Candidate, Job } from '@prisma/client';
import { ScoringStrategy, ScoringResult } from './scoring-strategy.interface';

@Injectable()
export class LocationStrategy implements ScoringStrategy {
  score(candidate: Candidate, job: Job): ScoringResult {
    return {
      value: candidate.location === job.location ? 1 : 0,
      reason: 'location',
    };
  }
}
