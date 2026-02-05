// matching/scoring/scoring.module.ts
import { Module } from '@nestjs/common';
import { SkillStrategy } from './skill.strategy';
import { ExperienceStrategy } from './experience.strategy';
import { LocationStrategy } from './location.strategy';
import { CompositeScoringStrategy } from './composite-scoring.strategy';

@Module({
  providers: [
    SkillStrategy,
    ExperienceStrategy,
    LocationStrategy,
    {
      provide: CompositeScoringStrategy,
      useFactory: (
        skill: SkillStrategy,
        experience: ExperienceStrategy,
        location: LocationStrategy,
      ) => new CompositeScoringStrategy([skill, experience, location]),
      inject: [SkillStrategy, ExperienceStrategy, LocationStrategy],
    },
  ],
  exports: [CompositeScoringStrategy],
})
export class ScoringModule {}
