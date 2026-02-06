// matching/scoring/composite-scoring.strategy.ts
import { Injectable } from '@nestjs/common';
import type { Candidate, Job } from '@prisma/client';
import { ScoringStrategy } from './scoring-strategy.interface';

type CompositeScore = {
  total: number;
  breakdown: Record<string, number>;
};

@Injectable()
export class CompositeScoringStrategy {
  constructor(private readonly strategies: ScoringStrategy[]) {}

  score(candidate: Candidate, job: Job): CompositeScore {
    let total = 0;
    const breakdown: Record<string, number> = {};

    for (const strategy of this.strategies) {
      const { value, reason } = strategy.score(candidate, job);
      breakdown[reason] = value;
      total += value;
    }

    return {
      total,
      breakdown,
    };
  }
}
