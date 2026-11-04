import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { AuthSignup } from '../../../src/auth/application/auth-signup/auth-signup';
import { AuthLogin } from '../../../src/auth/application/auth-login/auth-login';
import { AuthMockRepository } from '../../../src/auth/infrastructure/repository/auth-mock-repository';
import { InvalidCredentialsError } from '../../../src/auth/domain/errors/auth-errors';
import { InMemoryRefreshTokenRepository } from '../helpers/in-memory-refresh-token-repository';

describe('AuthLogin', () => {
  let refreshRepository: InMemoryRefreshTokenRepository;
  let login: AuthLogin;

  beforeEach(async () => {
    const authRepository = new AuthMockRepository();
    refreshRepository = new InMemoryRefreshTokenRepository();
    login = new AuthLogin(authRepository, refreshRepository);

    await new AuthSignup(authRepository).execute(
      'Ana',
      'ana@mail.com',
      'secret1'
    );
  });

  it('devuelve access token, refresh token y datos del usuario', async () => {
    const result = await login.execute('ana@mail.com', 'secret1');

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe('ana@mail.com');
    expect(result.user.name).toBe('Ana');
  });

  it('firma el access token con el id y email del usuario', async () => {
    const result = await login.execute('ana@mail.com', 'secret1');

    const payload = jwt.verify(result.accessToken, config.JWT.secret) as {
      id: string;
      email: string;
    };
    expect(payload.id).toBe(result.user.id);
    expect(payload.email).toBe('ana@mail.com');
  });

  it('guarda el refresh token en el repositorio', async () => {
    const result = await login.execute('ana@mail.com', 'secret1');

    expect(refreshRepository.tokens).toHaveLength(1);
    expect(refreshRepository.tokens[0]?.token.getValue()).toBe(
      result.refreshToken
    );
  });

  it('rechaza un password incorrecto', async () => {
    await expect(
      login.execute('ana@mail.com', 'incorrecta')
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rechaza un usuario que no existe', async () => {
    await expect(
      login.execute('nadie@mail.com', 'secret1')
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('no guarda ningún refresh token si el login falla', async () => {
    await login.execute('ana@mail.com', 'incorrecta').catch(() => undefined);

    expect(refreshRepository.tokens).toHaveLength(0);
  });
});