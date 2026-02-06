// matching/scoring/skill.strategy.ts
import { Injectable } from '@nestjs/common';
import type { Candidate, Job } from '@prisma/client';
import { ScoringStrategy, ScoringResult } from './scoring-strategy.interface';

@Injectable()
export class SkillStrategy implements ScoringStrategy {
  score(candidate: Candidate, job: Job): ScoringResult {
    const overlap = candidate.skills.filter((s) =>
      job.requiredSkills.includes(s),
    ).length;

    return {
      value: overlap / job.requiredSkills.length,
      reason: 'skill',
    };
  }
}
