import type { GetLeaderboardResponseDto } from '../../application/use-cases/get-leaderboard.use-case';

export interface LeaderboardCache {
  get(key: string): GetLeaderboardResponseDto | null;
  set(key: string, value: GetLeaderboardResponseDto, ttlMs?: number): void;
  delete(key: string): void;
}

export class InMemoryLeaderboardCache implements LeaderboardCache {
  private readonly entries = new Map<
    string,
    { value: GetLeaderboardResponseDto; expiresAt: number }
  >();

  get(key: string): GetLeaderboardResponseDto | null {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: GetLeaderboardResponseDto, ttlMs = 60_000): void {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }
}
