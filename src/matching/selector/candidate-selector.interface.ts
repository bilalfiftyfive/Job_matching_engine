export interface CandidateSelector {
  selectCandidates(job): AsyncIterable<any>;
}
