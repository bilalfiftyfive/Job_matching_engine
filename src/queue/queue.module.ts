import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { redisConfig } from '../config/redis.config';
import { JobMatchingService } from './job-matching/job-matching.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'job-matching',
      connection: redisConfig,
    }),
  ],
  providers: [JobMatchingService],
  exports: [JobMatchingService],
})
export class QueueModule {}

BullModule.registerQueue({
  name: 'job-matching',
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
