import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JobMatchingService } from 'src/queue/job-matching/job-matching.service';
import { JOB_CREATED_EVENT } from '../job.events';
import type { JobCreatedEvent } from '../job.events';

@Injectable()
export class JobCreatedListener {
  constructor(private readonly queue: JobMatchingService) {}

  @OnEvent(JOB_CREATED_EVENT)
  async handleJobCreated(payload: JobCreatedEvent) {
    await this.queue.enqueue(payload.jobId);
  }
}
