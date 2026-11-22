
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthLogout } from '../../../src/auth/application/auth-logout/auth-logout';
import { InMemoryRefreshTokenRepository } from '../helpers/in-memory-refresh-token-repository';
import { RefreshToken } from '../../../src/auth/domain/refresh-token';
import { RefreshTokenToken } from '../../../src/auth/domain/refresh-token-token';
import { RefreshTokenNotFoundError } from '../../../src/auth/domain/errors/refresh-token-errors';
import { v4 as uuidv4 } from 'uuid';

describe('AuthLogout', () => {
  let refreshRepository: InMemoryRefreshTokenRepository;
  let logout: AuthLogout;
  let userId: string;

  beforeEach(() => {
    refreshRepository = new InMemoryRefreshTokenRepository();
    logout = new AuthLogout(refreshRepository);
    userId = uuidv4();
  });

  it('revoca correctamente un refresh token', async () => {
    const tokenValue = 'refresh-logout';

    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        tokenValue,
        userId,
        new Date(Date.now() + 60000)
      )
    );

    await logout.execute(tokenValue);

    const savedToken = await refreshRepository.findByToken(
      new RefreshTokenToken(tokenValue)
    );

    expect(savedToken).not.toBeNull();
    expect(savedToken?.isRevoked.getValue()).toBe(true);
  });

  it('rechaza el cierre de sesión con un refresh token inexistente', async () => {
    await expect(
      logout.execute('token-inexistente')
    ).rejects.toThrow(RefreshTokenNotFoundError);
  });

  it('revoca todos los refresh tokens del usuario', async () => {
    const token1 = 'refresh-user-1';
    const token2 = 'refresh-user-2';

    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        token1,
        userId,
        new Date(Date.now() + 60000)
      )
    );

    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        token2,
        userId,
        new Date(Date.now() + 60000)
      )
    );

    await logout.executeAll(userId);

    const savedToken1 = await refreshRepository.findByToken(
      new RefreshTokenToken(token1)
    );
    const savedToken2 = await refreshRepository.findByToken(
      new RefreshTokenToken(token2)
    );

    expect(savedToken1?.isRevoked.getValue()).toBe(true);
    expect(savedToken2?.isRevoked.getValue()).toBe(true);
  });

  it('no revoca los tokens de otros usuarios', async () => {
    const anotherUserId = uuidv4();
    const ownToken = 'refresh-own-user';
    const otherToken = 'refresh-other-user';

    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        ownToken,
        userId,
        new Date(Date.now() + 60000)
      )
    );

    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        otherToken,
        anotherUserId,
        new Date(Date.now() + 60000)
      )
    );

    await logout.executeAll(userId);

    const savedOwnToken = await refreshRepository.findByToken(
      new RefreshTokenToken(ownToken)
    );
    const savedOtherToken = await refreshRepository.findByToken(
      new RefreshTokenToken(otherToken)
    );

    expect(savedOwnToken?.isRevoked.getValue()).toBe(true);
    expect(savedOtherToken?.isRevoked.getValue()).toBe(false);
  });
});
