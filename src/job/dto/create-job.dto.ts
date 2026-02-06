import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

const normalizeSkills = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value;
  return value.map((skill) => String(skill).toLowerCase());
};

export class CreateJobDto {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @Transform(({ value }) => {
    const raw = value as unknown;
    return normalizeSkills(raw);
  })
  requiredSkills: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience: number;

  @IsString()
  location: string;
}
