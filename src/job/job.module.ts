import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { JobCreatedListener } from './listeners/job-created.listener';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [JobController],
  providers: [JobService, JobCreatedListener],
})
export class JobModule {}
