import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SelectorModule } from '../selector/selector.module';
import { ScoringModule } from '../scoring/scoring.module';
import { RepositoryModule } from '../repository/repository.module';
import { MatchingProcessor } from './matching.processor';
import { MatchingJobRunner } from './matching-job.runner';

@Module({
  imports: [PrismaModule, SelectorModule, ScoringModule, RepositoryModule],
  providers: [MatchingProcessor, MatchingJobRunner],
})
export class WorkerModule {}
