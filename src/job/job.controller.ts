import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobMatchingService } from '../queue/job-matching/job-matching.service';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly queue: JobMatchingService,
  ) {}

  @Post()
  async create(@Body() dto: CreateJobDto) {
    const job = await this.jobService.create(dto);
    return job;
  }

  @Post(':id/match')
  async trigger(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.queue.enqueue(id);
    return { status: 'queued' };
  }
  @Get(':id/matches')
  async matches(@Param('id', new ParseUUIDPipe()) jobId: string) {
    return this.jobService.getMatches(jobId);
  }

  @Get(':id/matches/ranked')
  async ranked(
    @Param('id', new ParseUUIDPipe()) jobId: string,
    @Query() pagination: PaginationDto,
  ) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    return this.jobService.getRankedMatches(jobId, page, limit);
  }
}
