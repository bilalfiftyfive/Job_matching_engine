// matching/scoring/experience.strategy.ts
import { Injectable } from '@nestjs/common';
import type { Candidate, Job } from '@prisma/client';
import { ScoringStrategy, ScoringResult } from './scoring-strategy.interface';

@Injectable()
export class ExperienceStrategy implements ScoringStrategy {
  score(candidate: Candidate, job: Job): ScoringResult {
    if (job.minExperience === 0) {
      return { value: 1, reason: 'experience' };
    }

    return {
      value: Math.min(candidate.experienceYears / job.minExperience, 1),
      reason: 'experience',
    };
  }
}
