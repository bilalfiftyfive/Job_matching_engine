import { Injectable, Logger } from '@nestjs/common';
import { CandidateSelector } from './candidate-selector.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostgresCandidateSelector implements CandidateSelector {
  private readonly BATCH_SIZE = 500;
  private readonly logger = new Logger(PostgresCandidateSelector.name);

  constructor(private prisma: PrismaService) {}

  async *selectCandidates(job) {
    const requiredSkills = Array.isArray(job?.requiredSkills)
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        job.requiredSkills.map((skill: string) => skill.toLowerCase())
      : [];
    const minExperienceRaw = job?.minExperience;
    const minExperience =
      typeof minExperienceRaw === 'number'
        ? minExperienceRaw
        : Number(minExperienceRaw) || 0;

    let cursor: string | undefined;
    let batchIndex = 0;

    while (true) {
      batchIndex += 1;
      this.logger.log(
        `Fetching batch ${batchIndex} (cursor=${cursor ?? 'none'})`,
      );
      const batch = await this.prisma.candidate.findMany({
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
