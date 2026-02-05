// matching/scoring/skill.strategy.ts
import { Injectable } from '@nestjs/common';
import { ScoringStrategy } from './scoring-strategy.interface';

@Injectable()
export class SkillStrategy implements ScoringStrategy {
  score(candidate, job) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const overlap = candidate.skills.filter(
      (s: string) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        job.requiredSkills.includes(s),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ).length;

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      value: overlap / job.requiredSkills.length,
      reason: 'skill',
    };
  }
}
