// matching/scoring/experience.strategy.ts
import { Injectable } from '@nestjs/common';
import { ScoringStrategy } from './scoring-strategy.interface';

@Injectable()
export class ExperienceStrategy implements ScoringStrategy {
  score(candidate, job) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (job.minExperience === 0) {
      return { value: 1, reason: 'experience' };
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      value: Math.min(candidate.experienceYears / job.minExperience, 1),
      reason: 'experience',
    };
  }
}
