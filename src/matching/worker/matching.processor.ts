import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { PostgresCandidateSelector } from '../selector/postgres-candidate.selector';
import { CompositeScoringStrategy } from '../scoring/composite-scoring.strategy';
import { MatchRepository } from '../repository/match.repository';

type MatchJobData = {
  jobId: string;
  version?: number;
};

@Processor('job-matching')
export class MatchingProcessor extends WorkerHost {
  private readonly BATCH_SIZE = 500;
  private readonly logger = new Logger(MatchingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly selector: PostgresCandidateSelector,
    private readonly scorer: CompositeScoringStrategy,
    private readonly repository: MatchRepository,
  ) {
    super();
  }

  async process(job: Job<MatchJobData>) {
    if (job.name !== 'match') return;

    const { jobId, version = 1 } = job.data;
    this.logger.log(
      `Starting match job ${job.id} for jobId=${jobId} v${version}`,
    );

    let jobEntity;
    try {
      jobEntity = await this.prisma.job.findUnique({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { id: jobId },
      });
    } catch (err) {
      this.logger.error(`Failed to load job ${jobId}`, err as Error);
      throw err;
    }
    if (!jobEntity) {
      this.logger.warn(`Job not found for jobId=${jobId}; skipping`);
      return;
    }
    this.logger.log(
      `Loaded job ${jobId} (minExp=${jobEntity.minExperience}, skills=${jobEntity.requiredSkills?.length ?? 0})`,
    );

    const batch: {
      jobId: string;
      candidateId: string;
      score: number;
      scoreBreakdown: Record<string, number>;
      version: number;
      computedAt: Date;
    }[] = [];
    let totalProcessed = 0;
    let totalMatched = 0;

    try {
      for await (const candidate of this.selector.selectCandidates(jobEntity)) {
        try {
          totalProcessed += 1;
          const result = this.scorer.score(candidate, jobEntity);

          batch.push({
            jobId: jobEntity.id,
            candidateId: candidate.id,
            score: result.total,
            scoreBreakdown: result.breakdown,
            version,
            computedAt: new Date(),
          });
          totalMatched += 1;

          if (batch.length >= this.BATCH_SIZE) {
            await this.repository.bulkUpsert(batch);
            this.logger.log(
              `Flushed ${batch.length} matches for jobId=${jobId} (processed=${totalProcessed}, matched=${totalMatched})`,
            );
            batch.length = 0;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          this.logger.warn(
            `Skipping candidate due to scoring/upsert error (candidateId=${candidate?.id ?? 'unknown'})`,
          );
          continue;
        }
      }
    } catch (err) {
      this.logger.error(
        `Failed while selecting candidates for jobId=${jobId}`,
        err as Error,
      );
      throw err;
    }

    if (batch.length) {
      await this.repository.bulkUpsert(batch);
      this.logger.log(
        `Flushed ${batch.length} matches for jobId=${jobId} (processed=${totalProcessed}, matched=${totalMatched})`,
      );
    }

    this.logger.log(
      `Completed match job ${job.id} for jobId=${jobId} (processed=${totalProcessed}, matched=${totalMatched})`,
    );
  }
}
