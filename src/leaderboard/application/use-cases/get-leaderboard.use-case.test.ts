import test from 'node:test';
import assert from 'node:assert/strict';
import { GetLeaderboardUseCase } from './get-leaderboard.use-case';
import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry.entity';
import type {
  LeaderboardFilters,
  LeaderboardRepository,
} from '../../domain/repositories/leaderboard.repository';
import { InMemoryLeaderboardCache } from '../../infrastructure/cache/leaderboard-cache';

class FakeLeaderboardRepository implements LeaderboardRepository {
  public calls: LeaderboardFilters[] = [];

  async getLeaderboard(filters: LeaderboardFilters) {
    this.calls.push(filters);

    return {
      data: [
        new LeaderboardEntry(1, 'user-1', 'Ana', 'ana@example.com', 4, 5),
        new LeaderboardEntry(2, 'user-2', 'Beto', 'beto@example.com', 3, 2),
      ],
      total: 2,
    };
  }
}

test('returns a paginated leaderboard for a requested period', async () => {
  const repository = new FakeLeaderboardRepository();
  const cache = new InMemoryLeaderboardCache();
  const useCase = new GetLeaderboardUseCase(repository, cache);

  const result = await useCase.execute({
    period: 'weekly',
    page: 1,
    pageSize: 10,
  });

  assert.equal(result.meta.period, 'weekly');
  assert.equal(result.meta.page, 1);
  assert.equal(result.meta.pageSize, 10);
  assert.equal(result.data[0]?.name, 'Ana');
  assert.equal(result.data[0]?.solvedProblems, 4);
  assert.equal(result.data[0]?.correctSubmissions, 5);
  assert.equal(repository.calls.length, 1);
});

test('uses cache for repeated requests with the same filters', async () => {
  const repository = new FakeLeaderboardRepository();
  const cache = new InMemoryLeaderboardCache();
  const useCase = new GetLeaderboardUseCase(repository, cache);

  await useCase.execute({
    period: 'monthly',
    page: 1,
    pageSize: 10,
  });

  await useCase.execute({
    period: 'monthly',
    page: 1,
    pageSize: 10,
  });

  assert.equal(repository.calls.length, 1);
  assert.equal(cache.get('monthly:1:10')?.meta.period, 'monthly');
});
