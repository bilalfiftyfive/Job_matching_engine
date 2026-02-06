import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { MatchUpsertRecord } from './match.types';

@Injectable()
export class MatchRepository {
  private readonly logger = new Logger(MatchRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async bulkUpsert(records: MatchUpsertRecord[]) {
    if (!records.length) return;
    this.logger.log(`Upserting ${records.length} match results`);

    const values = records.map((r) => {
      const id = randomUUID();
      return Prisma.sql`
        (${id}, ${r.jobId}, ${r.candidateId}, ${r.score},
         ${Prisma.sql`${JSON.stringify(r.scoreBreakdown)}::jsonb`},
         ${r.version}, ${r.computedAt})
      `;
    });

    try {
      await this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO "MatchResult"
        ("id","jobId","candidateId","score","scoreBreakdown","version","computedAt")
        VALUES ${Prisma.join(values)}
        ON CONFLICT ("jobId","candidateId")
        DO UPDATE SET
          score = EXCLUDED.score,
          "scoreBreakdown" = EXCLUDED."scoreBreakdown",
          version = EXCLUDED.version,
          "computedAt" = EXCLUDED."computedAt"
      `);
      this.logger.log(`Upserted ${records.length} match results`);
    } catch (err) {
      this.logger.error('Failed to upsert match results', err as Error);
      throw err;
    }
  }
}
