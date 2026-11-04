import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthSignup } from '../../../src/auth/application/auth-signup/auth-signup';
import { AuthMockRepository } from '../../../src/auth/infrastructure/repository/auth-mock-repository';
import { AuthUserEmail } from '../../../src/auth/domain/auth-user-email';
import { UserAlreadyExistsError } from '../../../src/auth/domain/errors/auth-errors';

describe('AuthSignup', () => {
  let repository: AuthMockRepository;
  let signup: AuthSignup;

  beforeEach(() => {
    repository = new AuthMockRepository();
    signup = new AuthSignup(repository);
  });

  it('crea un usuario con los datos recibidos', async () => {
    const user = await signup.execute('Ana', 'ana@mail.com', 'secret1');

    expect(user.name.getValue()).toBe('Ana');
    expect(user.email.getValue()).toBe('ana@mail.com');
    expect(user.id.getValue()).toBeTruthy();
  });

  it('guarda el password hasheado y no en texto plano', async () => {
    const user = await signup.execute('Ana', 'ana@mail.com', 'secret1');
    const stored = user.password.getValue();

    expect(stored).not.toBe('secret1');
    expect(await bcrypt.compare('secret1', stored)).toBe(true);
  });

  it('guarda el usuario en el repositorio', async () => {
    await signup.execute('Ana', 'ana@mail.com', 'secret1');

    const found = await repository.findByEmail(
      new AuthUserEmail('ana@mail.com')
    );
    expect(found).not.toBeNull();
  });

  it('rechaza un email que ya está registrado', async () => {
    await signup.execute('Ana', 'ana@mail.com', 'secret1');

    await expect(
      signup.execute('Otra Ana', 'ana@mail.com', 'secret2')
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it('rechaza un password corto', async () => {
    await expect(signup.execute('Ana', 'ana@mail.com', '123')).rejects.toThrow(
      'Password must be at least 6 characters long'
    );
  });
});