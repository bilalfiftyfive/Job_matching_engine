// matching/scoring/location.strategy.ts
import { Injectable } from '@nestjs/common';
import { ScoringStrategy } from './scoring-strategy.interface';

@Injectable()
export class LocationStrategy implements ScoringStrategy {
  score(candidate, job) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      value: candidate.location === job.location ? 1 : 0,
      reason: 'location',
    };
  }
}
