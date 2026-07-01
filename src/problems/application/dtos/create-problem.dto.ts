import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTestCaseDto {
  @IsString()
  @IsNotEmpty()
  input!: string;

  @IsString()
  @IsNotEmpty()
  expectedOutput!: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsBoolean()
  isExample!: boolean;

  @IsInt()
  order!: number;
}

export class CreateStarterCodeDto {
  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class CreateProblemDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty!: 'EASY' | 'MEDIUM' | 'HARD';

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsArray()
  @IsString({ each: true })
  constraints!: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTestCaseDto)
  testCases!: CreateTestCaseDto[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateStarterCodeDto)
  starterCodes!: CreateStarterCodeDto[];
}

export class UpdateProblemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constraints?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
