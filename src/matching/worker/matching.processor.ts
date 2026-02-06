import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import type { MatchJobData } from '../../queue/job-matching/job-matching.types';
import { MatchingJobRunner } from './matching-job.runner';

@Processor('job-matching')
export class MatchingProcessor extends WorkerHost {
  private readonly logger = new Logger(MatchingProcessor.name);

  constructor(private readonly runner: MatchingJobRunner) {
    super();
  }

  async process(job: Job<MatchJobData>) {
    if (job.name !== 'match') return;

    this.logger.debug(`Dispatching match job ${job.id}`);
    await this.runner.run(job);
  }
}
