import { Question } from '../entities/Question';
import { TestSession } from '../entities/TestSession';
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
  data: Array<{
    id: string;
    name: string;
    description: string;
    company: {
      id: string;
      name: string;
      logo: string | null;
    };
    questions: Array<{
      id: string;
      type: string;
      difficulty: string;
    }>;
    difficulty: string;
    duration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestRepository {
  getAll(params: GetTestsParams): Promise<GetTestsResult>;
  getById(id: string): Promise<{
    id: string;
    name: string;
    description: string;
    company: {
      id: string;
      name: string;
      logo: string | null;
    };
    questions: Array<{
      id: string;
      type: string;
      difficulty: string;
      points: number;
    }>;
    difficulty: string;
    duration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
  createSession(
    testId: string,
    userId: string,
    expiresAt: Date
  ): Promise<TestSession>;
  getQuestionsByTestId(testId: string): Promise<Question[]>;
  getSessionById(sessionId: string): Promise<TestSession | null>;
  createSubmission(
    data: Omit<Submission, 'id' | 'submittedAt'>
  ): Promise<Submission>;
}
