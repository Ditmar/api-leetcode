import type { Question } from '../../domain/entities/Question';
import type { PublicProgrammingData } from '../../domain/entities/ProgrammingData';

export interface PublicOptionDto {
  id: string;
  text: string;
}

export interface PublicExampleDto {
  input: string;
  explanation: string | null;
}

export interface PublicProgrammingDataDto {
  starterCode: unknown;
  examples: PublicExampleDto[];
}

export interface PublicQuestionDto {
  id: string;
  type: string;
  text: string;
  difficulty: string;
  points: number;
  timeLimit: number | null;
  order: number;
  options?: PublicOptionDto[];
  programmingData?: PublicProgrammingDataDto;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const toPublicOptions = (options: unknown): PublicOptionDto[] => {
  if (!Array.isArray(options)) return [];
  return options.filter(isRecord).map(option => ({
    id: String(option.id ?? ''),
    text: String(option.text ?? ''),
  }));
};

export const toPublicProgrammingData = (
  data: PublicProgrammingData
): PublicProgrammingDataDto => ({
  starterCode: data.starterCode ?? null,
  examples: data.examples.map(example => ({
    input: example.input,
    explanation: example.explanation,
  })),
});

export const toPublicQuestionDto = (question: Question): PublicQuestionDto => {
  const base: PublicQuestionDto = {
    id: question.id,
    type: question.type,
    text: question.text,
    difficulty: question.difficulty,
    points: question.points,
    timeLimit: question.timeLimit ?? null,
    order: question.order,
  };

  if (question.type === 'MCQ' && question.options) {
    return { ...base, options: toPublicOptions(question.options) };
  }

  if (question.type === 'PROGRAMMING' && question.programmingPublic) {
    return {
      ...base,
      programmingData: toPublicProgrammingData(question.programmingPublic),
    };
  }

  return base;
};
