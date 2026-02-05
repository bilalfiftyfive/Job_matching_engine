// matching/scoring/composite-scoring.strategy.ts
import { Injectable } from '@nestjs/common';
import { ScoringStrategy } from './scoring-strategy.interface';

@Injectable()
export class CompositeScoringStrategy {
  constructor(private readonly strategies: ScoringStrategy[]) {}

  score(candidate, job) {
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
