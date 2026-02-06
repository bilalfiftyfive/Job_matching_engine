import { Injectable, Logger } from '@nestjs/common';
import type { Candidate, Job } from '@prisma/client';
import { CandidateSelector } from './candidate-selector.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostgresCandidateSelector implements CandidateSelector {
  private readonly BATCH_SIZE = 500;
  private readonly logger = new Logger(PostgresCandidateSelector.name);

  constructor(private prisma: PrismaService) {}

  async *selectCandidates(job: Job): AsyncIterable<Candidate> {
    const requiredSkills = job.requiredSkills.map((skill) =>
      skill.toLowerCase(),
    );
    const minExperience = job.minExperience;

    let cursor: string | undefined;
    let batchIndex = 0;

    while (true) {
      batchIndex += 1;
      this.logger.log(
        `Fetching batch ${batchIndex} (cursor=${cursor ?? 'none'})`,
      );
      const batch: Candidate[] = await this.prisma.candidate.findMany({
        where: {
          experienceYears: { gte: minExperience },
          ...(requiredSkills.length
            ? { skills: { hasSome: requiredSkills } }
            : {}),
        },
        take: this.BATCH_SIZE,
        orderBy: { id: 'asc' },
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      this.logger.log(`Fetched batch ${batchIndex} size=${batch.length}`);
      if (!batch.length) break;

      for (const c of batch) yield c;
      cursor = batch[batch.length - 1].id;
    }
  }
}
