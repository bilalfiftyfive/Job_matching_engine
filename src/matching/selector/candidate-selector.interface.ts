import type { Candidate, Job } from '@prisma/client';

export interface CandidateSelector {
  selectCandidates(job: Job): AsyncIterable<Candidate>;
}
