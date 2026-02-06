import type { Candidate, Job } from '@prisma/client';

export type ScoringResult = { value: number; reason: string };

export interface ScoringStrategy {
  score(candidate: Candidate, job: Job): ScoringResult;
}
