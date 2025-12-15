import { AuthLogin } from '../../../auth/application/auth-login/auth-login';
import { AuthMockRepository } from '../../../auth/infrastructure/repository/auth-mock-repository';
import { InvalidCredentialsError } from '../../../auth/domain/errors/auth-errors';
import bcrypt from 'bcrypt';
import { AuthUser } from '../../../auth/domain/auth-user';
jest.mock('uuid');
describe('AuthLogin', () => {
  let repo: AuthMockRepository;
  let login: AuthLogin;

  beforeEach(async () => {
    repo = new AuthMockRepository();
    login = new AuthLogin(repo);

    const hashedPassword = await bcrypt.hash('12345678', 10);
    const user = new AuthUser(
      '1',
      'john_doe',
      'john@example.com',
      hashedPassword
    );
    await repo.create(user);
  });

  it('should login successfully with valid credentials', async () => {
    const result = await login.execute('john@example.com', '12345678');
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('john@example.com');
  });

  it('should throw error for non-existent email', async () => {
    await expect(login.execute('nope@example.com', '12345678')).rejects.toThrow(
      InvalidCredentialsError
    );
  });

  it('should throw error for wrong password', async () => {
    await expect(
      login.execute('john@example.com', 'wrongpass')
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
