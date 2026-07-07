import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreateSubmissionUseCase } from '../application/use-cases/create-submission.use-case';
import { GetSubmissionByIdUseCase } from '../application/use-cases/get-submission-by-id.use-case';
import { Submission } from '../domain/entities/submission.entity';
import type { SubmissionRepository } from '../domain/repositories/submission.repository';

class InMemorySubmissionRepository implements SubmissionRepository {
  private readonly submissions = new Map<string, Submission>();

  async create(submission: Submission): Promise<Submission> {
    this.submissions.set(submission.id, submission);
    return submission;
  }

  async findById(id: string): Promise<Submission | null> {
    return this.submissions.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      submission => submission.userId === userId
    );
  }

  async update(submission: Submission): Promise<Submission> {
    this.submissions.set(submission.id, submission);
    return submission;
  }
}

test('CreateSubmissionUseCase should persist and process a submission', async () => {
  const repository = new InMemorySubmissionRepository();
  const useCase = new CreateSubmissionUseCase(repository, {
    process: async submission => ({
      ...submission,
      status: 'accepted',
      runtime: 15,
      memory: 64,
    }),
  });

  const created = await useCase.execute({
    problemId: 'problem-1',
    language: 'typescript',
    code: 'const answer = 42;',
    userId: 'user-1',
  });

  assert.equal(created.status, 'accepted');
  assert.equal(created.problemId, 'problem-1');
  assert.equal(created.userId, 'user-1');
});

test('GetSubmissionByIdUseCase should return an existing submission', async () => {
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

  assert.equal(result?.id, 'submission-1');
  assert.equal(result?.status, 'pending');
});
