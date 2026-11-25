import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  problemId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'c',
    'go',
    'rust',
  ])
  language!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  code!: string;

  userId?: string;
}
