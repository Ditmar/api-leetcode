import test from 'node:test';
import assert from 'node:assert/strict';
import { RankingService } from './ranking.service';

test('orders ranking by points and paginates the results', () => {
  const service = new RankingService();

  const rows = [
    {
      userId: 'u-2',
      userName: 'Bob',
      avatar: 'bob.png',
      totalPoints: 90,
      submissions: 2,
      correctAnswers: 10,
      averageScore: 75,
    },
    {
      userId: 'u-1',
      userName: 'Alice',
      avatar: 'alice.png',
      totalPoints: 120,
      submissions: 3,
      correctAnswers: 12,
      averageScore: 80,
    },
    {
      userId: 'u-3',
      userName: 'Carol',
      avatar: 'carol.png',
      totalPoints: 120,
      submissions: 1,
      correctAnswers: 8,
      averageScore: 90,
    },
  ];

  const result = service.calculateRanking(rows, {
    sort: 'points',
    limit: 2,
    offset: 0,
  });

  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].userId, 'u-1');
  assert.equal(result.items[1].userId, 'u-3');
  assert.equal(result.items[0].position, 1);
  assert.equal(result.items[1].position, 2);
  assert.equal(result.pagination.total, 3);
  assert.equal(result.pagination.limit, 2);
  assert.equal(result.pagination.offset, 0);
});

test('sorts by average score when requested', () => {
  const service = new RankingService();

  const rows = [
    {
      userId: 'u-1',
      userName: 'Alice',
      avatar: 'alice.png',
      totalPoints: 100,
      submissions: 2,
      correctAnswers: 10,
      averageScore: 70,
    },
    {
      userId: 'u-2',
      userName: 'Bob',
      avatar: 'bob.png',
      totalPoints: 90,
      submissions: 2,
      correctAnswers: 10,
      averageScore: 80,
    },
  ];

  const result = service.calculateRanking(rows, {
    sort: 'average',
    limit: 10,
    offset: 0,
  });

  assert.equal(result.items[0].userId, 'u-2');
  assert.equal(result.items[1].userId, 'u-1');
});
