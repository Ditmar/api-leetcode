import { AuthLogin } from '../../../auth/application/auth-login/auth-login';
import { AuthMockRepository } from '../../../auth/infrastructure/repository/auth-mock-repository';
import { InvalidCredentialsError } from '../../../auth/domain/errors/auth-errors';
import bcrypt from 'bcrypt';
import { AuthUser } from '../../../auth/domain/auth-user';

export async function testAuthLogin() {
  console.log('Running AuthLogin tests...');

  const repo = new AuthMockRepository();
  const login = new AuthLogin(repo);

  // Prepare valid user
  const hashedPassword = await bcrypt.hash('12345678', 10);
  const user = new AuthUser(
    '1',
    'john_doe',
    'john@example.com',
    hashedPassword
  );
  await repo.create(user);

  // Case 1: Successful login
  try {
    const result = await login.execute('john@example.com', '12345678');
    console.log('Successful login:', result);
  } catch (err) {
    console.error('Failed successful login', err);
  }

  // Case 2: Non-existent email
  try {
    await login.execute('nope@example.com', '12345678');
    console.error('Did not throw error for non-existent email');
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      console.log('Expected error for non-existent email:', err.message);
    } else {
      console.error('Unexpected error for non-existent email', err);
    }
  }

  // Case 3: Wrong password
  try {
    await login.execute('john@example.com', 'wrongpass');
    console.error('Did not throw error for wrong password');
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      console.log('Expected error for wrong password:', err.message);
    } else {
      console.error('Unexpected error for wrong password', err);
    }
  }
}
