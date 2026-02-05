import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Array.isArray(value) ? value.map((skill) => skill.toLowerCase()) : value,
  )
  requiredSkills: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience: number;

  @IsString()
  location: string;
}
