import { expect, it } from 'vitest';
import { CreateSubmissionUseCase } from '../application/use-cases/create-submission.use-case';
import { GetSubmissionByIdUseCase } from '../application/use-cases/get-submission-by-id.use-case';
import { Submission } from '../domain/entities/submission.entity';
import type { SubmissionRepository } from '../domain/repositories/submission.repository';
import { SubmissionsController } from '../infrastructure/controllers/submissions.controller';
import { DefaultExecutionWorker } from '../infrastructure/services/default-execution-worker';

class InMemorySubmissionRepository implements SubmissionRepository {
  private readonly submissions = new Map<string, Submission>();

  async create(submission: Submission): Promise<Submission> {
    this.submissions.set(submission.getId(), submission);
    return submission;
  }

  async findById(id: string): Promise<Submission | null> {
    return this.submissions.get(id) ?? null;
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<Submission[]> {
    const filtered = Array.from(this.submissions.values()).filter(
      submission => submission.getUserId() === userId
    );
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }

  async update(submission: Submission): Promise<Submission> {
    this.submissions.set(submission.getId(), submission);
    return submission;
  }
}

it('DefaultExecutionWorker should reject empty code submissions', async () => {
  const worker = new DefaultExecutionWorker();
  const submission = new Submission(
    'submission-empty',
    'problem-1',
    'user-1',
    'typescript',
    '   ',
    'pending',
    null,
    null,
    new Date()
  );

  const processed = await worker.process(submission);

  expect(processed.getStatus()).toBe('rejected');
});

it('CreateSubmissionUseCase should persist and process a submission', async () => {
  const repository = new InMemorySubmissionRepository();
  const useCase = new CreateSubmissionUseCase(repository, {
    process: async submission =>
      new Submission(
        submission.getId(),
        submission.getProblemId(),
        submission.getUserId(),
        submission.getLanguage(),
        submission.getCode(),
        'accepted',
        15,
        64,
        submission.getCreatedAt()
      ),
  });

  const created = await useCase.execute({
    problemId: 'problem-1',
    language: 'typescript',
    code: 'const answer = 42;',
    userId: 'user-1',
  });

  expect(created.getStatus()).toBe('accepted');
  expect(created.getProblemId()).toBe('problem-1');
  expect(created.getUserId()).toBe('user-1');
});

it('CreateSubmissionUseCase should require userId', async () => {
  const repository = new InMemorySubmissionRepository();
  const useCase = new CreateSubmissionUseCase(repository, {
    process: async submission => submission,
  });

  await expect(() =>
    useCase.execute({
      problemId: 'problem-1',
      language: 'typescript',
      code: 'const answer = 42;',
    } as never)
  ).rejects.toThrow(/userId is required/);
});

it('GetSubmissionByIdUseCase should return an existing submission', async () => {
  const repository = new InMemorySubmissionRepository();
  const submission = new Submission(
    'submission-1',
    'problem-1',
    'user-1',
    'typescript',
    'const value = 1;',
    'pending',
    null,
    null,
    new Date('2026-01-01T00:00:00.000Z')
  );
  await repository.create(submission);

  const useCase = new GetSubmissionByIdUseCase(repository);
  const result = await useCase.execute('submission-1');

  expect(result?.getId()).toBe('submission-1');
  expect(result?.getStatus()).toBe('pending');
});

it('SubmissionsController should reject invalid submission payloads', async () => {
  const controller = new SubmissionsController(
    {
      execute: async () => {
        throw new Error('should not create submission');
      },
    } as never,
    { execute: async () => null } as never,
    { execute: async () => [] } as never
  );

  const res = {
    statusCode: 200,
    body: undefined as { message?: string } | undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: { message?: string }) {
      this.body = payload;
      return this;
    },
  };

  await controller.create(
    {
      body: { problemId: 'problem-1', language: 'cobol', code: '   ' },
      userId: 'user-1',
    } as never,
    res as never
  );

  expect(res.statusCode).toBe(400);
  expect(typeof res.body?.message).toBe('string');
  expect(res.body!.message!.length).toBeGreaterThan(0);
});

it('SubmissionsController should forbid access to another user submission', async () => {
  const controller = new SubmissionsController(
    { execute: async () => null } as never,
    {
      execute: async () =>
        new Submission(
          'submission-2',
          'problem-1',
          'user-2',
          'typescript',
          'const answer = 42;',
          'accepted',
          10,
          32,
          new Date()
        ),
    } as never,
    { execute: async () => [] } as never
  );

  const res = {
    statusCode: 200,
    body: undefined as { message?: string } | undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: { message?: string }) {
      this.body = payload;
      return this;
    },
  };

  await controller.getById(
    {
      params: { id: 'submission-2' },
      userId: 'user-1',
    } as never,
    res as never
  );

  expect(res.statusCode).toBe(403);
  expect(res.body?.message).toBe('Forbidden');
});

it('SubmissionsController should forbid access to another user history', async () => {
  const controller = new SubmissionsController(
    { execute: async () => null } as never,
    { execute: async () => null } as never,
    { execute: async () => [] } as never
  );

  const res = {
    statusCode: 200,
    body: undefined as { message?: string } | undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: { message?: string }) {
      this.body = payload;
      return this;
    },
  };

  await controller.getByUserId(
    {
      params: { id: 'user-2' },
      query: {},
      userId: 'user-1',
    } as never,
    res as never
  );

  expect(res.statusCode).toBe(403);
  expect(res.body?.message).toBe('Forbidden');
});
