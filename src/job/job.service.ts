import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { CreateJobDto } from './dto/create-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JOB_CREATED_EVENT } from './job.events';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private events: EventEmitter2,
  ) {}

  async create(dto: CreateJobDto) {
    const job = await this.prisma.job.create({ data: dto });
    this.events.emit(JOB_CREATED_EVENT, { jobId: job.id });
    return job;
  }

  findById(id: string) {
    return this.prisma.job.findUnique({ where: { id } });
  }

  async getMatches(jobId: string) {
    return this.prisma.matchResult.findMany({
      where: { jobId },
      include: {
        candidate: true,
      },
    });
  }

  async getRankedMatches(jobId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.matchResult.findMany({
        where: { jobId },
        include: { candidate: true },
        orderBy: { score: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.matchResult.count({ where: { jobId } }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
