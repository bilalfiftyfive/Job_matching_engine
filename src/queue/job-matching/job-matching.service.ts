import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobMatchingService {
  constructor(@InjectQueue('job-matching') private readonly queue: Queue) {}

  async enqueue(jobId: string, version = 1) {
    await this.queue.add(
      'match',
      { jobId, version, triggeredAt: new Date() },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
      },
    );
  }
}
