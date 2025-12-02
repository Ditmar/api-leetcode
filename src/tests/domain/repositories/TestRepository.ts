import { Test } from '../entities/Test';
import { TestSession } from '../entities/TestSession';
import { Question } from '../entities/Question';
import { Submission } from '../entities/Submission';

export interface GetTestsParams {
  page: number;
  limit: number;
  search?: string;
  companyId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  orderBy?: string;
}

export interface GetTestsResult {
  data: Test[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOption?: string;
  code?: string;
  language?: string;
  isCorrect?: boolean;
  points?: number;
  answeredAt: Date;
  question?: Question;
}

export interface SessionWithRelations extends TestSession {
  test?: Test;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface TestRepository {
  getAll(params: GetTestsParams): Promise<GetTestsResult>;
  getById(id: string): Promise<Test | null>;

  createSession(
    testId: string,
    userId: string,
    expiresAt: Date
  ): Promise<TestSession>;

  getQuestionsByTestId(testId: string): Promise<Question[]>;
  getSessionById(sessionId: string): Promise<SessionWithRelations | null>;
  createSubmission(
    data: Omit<Submission, 'id' | 'submittedAt'>
  ): Promise<Submission>;

  saveAnswer(data: {
    sessionId: string;
    questionId: string;
    selectedOption?: string;
    code?: string;
    language?: string;
  }): Promise<Answer>;

  getAnswersBySessionId(sessionId: string): Promise<Answer[]>;
}
