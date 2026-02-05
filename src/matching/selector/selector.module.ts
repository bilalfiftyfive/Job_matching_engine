import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PostgresCandidateSelector } from './postgres-candidate.selector';

@Module({
  imports: [PrismaModule],
  providers: [PostgresCandidateSelector],
  exports: [PostgresCandidateSelector],
})
export class SelectorModule {}
