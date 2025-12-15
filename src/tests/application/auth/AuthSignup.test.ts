import { AuthSignup } from '../../../auth/application/auth-signup/auth-signup';
import { AuthMockRepository } from '../../../auth/infrastructure/repository/auth-mock-repository';
import { UserAlreadyExistsError } from '../../../auth/domain/errors/auth-errors';
jest.mock('uuid');
describe('AuthSignup', () => {
  let repo: AuthMockRepository;
  let signup: AuthSignup;

  beforeEach(() => {
    repo = new AuthMockRepository();
    signup = new AuthSignup(repo);
  });

  it('should register a new user successfully', async () => {
    const user = await signup.execute(
      'john_doe',
      'john@example.com',
      '12345678'
    );
    expect(user.toJSON()).toMatchObject({
      name: 'john_doe',
      email: 'john@example.com',
    });
  });

  it('should throw error for duplicate email', async () => {
    await signup.execute('john_doe', 'john@example.com', '12345678');
    await expect(
      signup.execute('john_doe2', 'john@example.com', '12345678')
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('should throw error for duplicate username', async () => {
    await signup.execute('john_doe', 'john@example.com', '12345678');
    await expect(
      signup.execute('john_doe', 'john2@example.com', '12345678')
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('should throw error for invalid password', async () => {
    await expect(
      signup.execute('short_pass', 'short@example.com', '123')
    ).rejects.toThrow('Password must be at least 8 characters long');
  });
});
