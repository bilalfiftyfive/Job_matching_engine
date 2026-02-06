export type MatchUpsertRecord = {
  jobId: string;
  candidateId: string;
  score: number;
  scoreBreakdown: Record<string, number>;
  version: number;
  computedAt: Date;
};
