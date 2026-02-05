export interface ScoringStrategy {
  score(candidate, job): { value: number; reason: string };
}
