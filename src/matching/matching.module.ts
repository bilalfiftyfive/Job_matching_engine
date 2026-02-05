import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { SelectorModule } from './selector/selector.module';
import { ScoringModule } from './scoring/scoring.module';
import { RankingModule } from './ranking/ranking.module';
import { RepositoryModule } from './repository/repository.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    PrismaModule,
    SelectorModule,
    ScoringModule,
    RankingModule,
    RepositoryModule,
    WorkerModule,
  ],
})
export class MatchingModule {}
