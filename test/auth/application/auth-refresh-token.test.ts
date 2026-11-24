
import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@config';
import { AuthSignup } from '../../../src/auth/application/auth-signup/auth-signup';
import { AuthRefreshToken } from '../../../src/auth/application/auth-refresh-token/auth-refresh-token';
import { AuthMockRepository } from '../../../src/auth/infrastructure/repository/auth-mock-repository';
import { InMemoryRefreshTokenRepository } from '../helpers/in-memory-refresh-token-repository';
import {
  RefreshTokenNotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../../../src/auth/domain/errors/refresh-token-errors';
import { RefreshToken } from '../../../src/auth/domain/refresh-token';

describe('AuthRefreshToken', () => {
  let authRepository: AuthMockRepository;
  let refreshRepository: InMemoryRefreshTokenRepository;
  let refresh: AuthRefreshToken;
  let userId: string;

  beforeEach(async () => {
    authRepository = new AuthMockRepository();
    refreshRepository = new InMemoryRefreshTokenRepository();
    refresh = new AuthRefreshToken(authRepository, refreshRepository);

    const signup = new AuthSignup(authRepository);
    const user = await signup.execute('Ana', 'ana@mail.com', 'secret1');
    userId = user.id.getValue();
  });

  it('renueva correctamente los tokens', async () => {
    const originalToken = new RefreshToken(
      uuidv4(),
      'refresh-original',
      userId,
      new Date(Date.now() + 60000)
    );

    await refreshRepository.create(originalToken);

    const result = await refresh.execute('refresh-original');

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toBe('refresh-original');
    expect(originalToken.isRevoked.getValue()).toBe(true);

    const savedToken = await refreshRepository.findByToken(
      new (await import('../../../src/auth/domain/refresh-token-token')).RefreshTokenToken(
        result.refreshToken
      )
    );

    expect(savedToken).not.toBeNull();
    expect(savedToken?.isRevoked.getValue()).toBe(false);
  });

  it('firma el nuevo access token con los datos del usuario', async () => {
    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        'refresh-original',
        userId,
        new Date(Date.now() + 60000)
      )
    );

    const result = await refresh.execute('refresh-original');

    const payload = jwt.verify(result.accessToken, config.JWT.secret) as {
      id: string;
      email: string;
    };

    expect(payload.id).toBe(userId);
    expect(payload.email).toBe('ana@mail.com');
  });

  it('rechaza un refresh token inexistente', async () => {
    await expect(
      refresh.execute('token-inexistente')
    ).rejects.toBeInstanceOf(RefreshTokenNotFoundError);
  });

  it('rechaza un refresh token expirado', async () => {
    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        'refresh-expirado',
        userId,
        new Date(Date.now() - 1000)
      )
    );

    await expect(
      refresh.execute('refresh-expirado')
    ).rejects.toBeInstanceOf(RefreshTokenExpiredError);
  });

  it('rechaza un refresh token revocado y revoca los demás tokens', async () => {
    const revokedToken = new RefreshToken(
      uuidv4(),
      'refresh-revocado',
      userId,
      new Date(Date.now() + 60000),
      undefined,
      true
    );

    const anotherToken = new RefreshToken(
      uuidv4(),
      'refresh-activo',
      userId,
      new Date(Date.now() + 60000)
    );

    await refreshRepository.create(revokedToken);
    await refreshRepository.create(anotherToken);

    await expect(
      refresh.execute('refresh-revocado')
    ).rejects.toBeInstanceOf(RefreshTokenRevokedError);

    expect(anotherToken.isRevoked.getValue()).toBe(true);
  });

  it('impide reutilizar un refresh token después de renovarlo', async () => {
    await refreshRepository.create(
      new RefreshToken(
        uuidv4(),
        'refresh-original',
        userId,
        new Date(Date.now() + 60000)
      )
    );

    const firstResult = await refresh.execute('refresh-original');

    await expect(
      refresh.execute('refresh-original')
    ).rejects.toBeInstanceOf(RefreshTokenRevokedError);

    const replacementToken = refreshRepository.tokens.find(
      token => token.token.getValue() === firstResult.refreshToken
    );

    expect(replacementToken?.isRevoked.getValue()).toBe(true);
  });

  it('impide la rotación simultánea del mismo refresh token', async () => {
    const originalToken = new RefreshToken(
      uuidv4(),
      'refresh-simultaneo',
      userId,
      new Date(Date.now() + 60000)
    );

    await refreshRepository.create(originalToken);

    const results = await Promise.allSettled([
      refresh.execute('refresh-simultaneo'),
      refresh.execute('refresh-simultaneo'),
    ]);

    const successfulRequests = results.filter(
      result => result.status === 'fulfilled'
    );

    const rejectedRequests = results.filter(
      result => result.status === 'rejected'
    );

    expect(successfulRequests).toHaveLength(1);
    expect(rejectedRequests).toHaveLength(1);

    expect(originalToken.isRevoked.getValue()).toBe(true);

    // El intento de reutilización debe revocar también el token nuevo.
    const activeTokens = refreshRepository.tokens.filter(
      token => !token.isRevoked.getValue()
    );

    expect(activeTokens).toHaveLength(0);
  });
});
