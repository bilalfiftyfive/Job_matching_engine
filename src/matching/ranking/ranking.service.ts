import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  rank(
    matches: {
      score: number;
      experienceYears: number;
    }[],
  ) {
    return matches.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.experienceYears - a.experienceYears;
    });
  }
}
