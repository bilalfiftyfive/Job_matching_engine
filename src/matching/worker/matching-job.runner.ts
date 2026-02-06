import { Injectable, Logger } from '@nestjs/common';
import type { Job as BullJob } from 'bullmq';
import type { Job as PrismaJob, Candidate } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PostgresCandidateSelector } from '../selector/postgres-candidate.selector';
import { CompositeScoringStrategy } from '../scoring/composite-scoring.strategy';
import { MatchRepository } from '../repository/match.repository';
import type { MatchUpsertRecord } from '../repository/match.types';
import type { MatchJobData } from '../../queue/job-matching/job-matching.types';

type MatchTotals = {
  processed: number;
  matched: number;
};

@Injectable()
export class MatchingJobRunner {
  private readonly BATCH_SIZE = 500;
  private readonly logger = new Logger(MatchingJobRunner.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly selector: PostgresCandidateSelector,
    private readonly scorer: CompositeScoringStrategy,
    private readonly repository: MatchRepository,
  ) {}

  async run(job: BullJob<MatchJobData>): Promise<void> {
    const { jobId, version = 1 } = job.data;
    this.logStart(job.id, jobId, version);

    const jobEntity = await this.loadJob(jobId);
    if (!jobEntity) {
      this.logger.warn(`Job not found for jobId=${jobId}; skipping`);
      return;
    }
    this.logLoaded(jobEntity);

    const totals = await this.processCandidates(jobEntity, jobId, version);

    this.logCompleted(job.id, jobId, totals);
  }

  private logStart(
    queueJobId: string | number | undefined,
    jobId: string,
    version: number,
  ) {
    this.logger.log(
      `Starting match job ${queueJobId ?? 'unknown'} for jobId=${jobId} v${version}`,
    );
  }

  private logLoaded(job: PrismaJob) {
    this.logger.log(
      `Loaded job ${job.id} (minExp=${job.minExperience}, skills=${job.requiredSkills.length})`,
    );
  }

  private logCompleted(
    queueJobId: string | number | undefined,
    jobId: string,
    totals: MatchTotals,
  ) {
    this.logger.log(
      `Completed match job ${queueJobId ?? 'unknown'} for jobId=${jobId} (processed=${totals.processed}, matched=${totals.matched})`,
    );
  }

  private async loadJob(jobId: string): Promise<PrismaJob | null> {
    try {
      return await this.prisma.job.findUnique({
        where: { id: jobId },
      });
    } catch (err) {
      this.logger.error(`Failed to load job ${jobId}`, err as Error);
      throw err;
    }
  }

  private async processCandidates(
    jobEntity: PrismaJob,
    jobId: string,
    version: number,
  ): Promise<MatchTotals> {
    const batch: MatchUpsertRecord[] = [];
    const totals: MatchTotals = { processed: 0, matched: 0 };

    try {
      for await (const candidate of this.selector.selectCandidates(jobEntity)) {
        totals.processed += 1;
        const record = this.tryBuildRecord(candidate, jobEntity, version);
        if (!record) continue;

        batch.push(record);
        totals.matched += 1;

        if (batch.length >= this.BATCH_SIZE) {
          await this.flushBatch(batch, jobId, totals);
        }
      }
    } catch (err) {
      this.logger.error(
        `Failed while selecting candidates for jobId=${jobId}`,
        err as Error,
      );
      throw err;
    }

    await this.flushBatch(batch, jobId, totals);
    return totals;
  }

  private tryBuildRecord(
    candidate: Candidate,
    jobEntity: PrismaJob,
    version: number,
  ): MatchUpsertRecord | null {
    try {
      const result = this.scorer.score(candidate, jobEntity);

      return {
        jobId: jobEntity.id,
        candidateId: candidate.id,
        score: result.total,
        scoreBreakdown: result.breakdown,
        version,
        computedAt: new Date(),
      };
    } catch {
      this.logger.warn(
        `Skipping candidate due to scoring/upsert error (candidateId=${candidate.id})`,
      );
      return null;
    }
  }

  private async flushBatch(
    batch: MatchUpsertRecord[],
    jobId: string,
    totals: MatchTotals,
  ): Promise<void> {
    if (!batch.length) return;

    await this.repository.bulkUpsert(batch);
    this.logger.log(
      `Flushed ${batch.length} matches for jobId=${jobId} (processed=${totals.processed}, matched=${totals.matched})`,
    );
    batch.length = 0;
  }
}
