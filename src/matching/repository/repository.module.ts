import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MatchRepository } from './match.repository';

@Module({
  imports: [PrismaModule],
  providers: [MatchRepository],
  exports: [MatchRepository],
})
export class RepositoryModule {}
