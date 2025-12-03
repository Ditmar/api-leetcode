import { AuthSignup } from '../../../auth/application/auth-signup/auth-signup';
import { AuthMockRepository } from '../../../auth/infrastructure/repository/auth-mock-repository';
import { UserAlreadyExistsError } from '../../../auth/domain/errors/auth-errors';

export async function testAuthSignup() {
  console.log('Running AuthSignup tests...');

  const repo = new AuthMockRepository();
  const signup = new AuthSignup(repo);

  // Case 1: Successful registration
  try {
    const user = await signup.execute(
      'john_doe',
      'john@example.com',
      '12345678'
    );
    console.log('Successful registration:', user.toJSON());
  } catch (err) {
    console.error(' Failed successful registration', err);
  }

  // Case 2: Duplicate email
  try {
    await signup.execute('john_doe2', 'john@example.com', '12345678');
    console.error('Did not throw error for duplicate email');
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      console.log('Expected error for duplicate email:', err.message);
    } else {
      console.error('Unexpected error for duplicate email', err);
    }
  }

  // Case 3: Duplicate username
  try {
    await signup.execute('john_doe', 'john2@example.com', '12345678');
    console.error('Did not throw error for duplicate username');
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      console.log('Expected error for duplicate username:', err.message);
    } else {
      console.error('Unexpected error for duplicate username', err);
    }
  }

  // Case 4: Invalid password (< 8 characters)
  try {
    await signup.execute('short_pass', 'short@example.com', '123');
    console.error('Did not throw error for invalid password');
  } catch (err) {
    console.log('Expected error for invalid password:', (err as Error).message);
  }
}
