import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUser } from '../../domain/auth-user';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { AuthUserPassword } from '../../domain/auth-user-password';
import { UserAlreadyExistsError } from '../../domain/errors/auth-errors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../../share/infrastructure/config';

export class AuthSignup {
  constructor(private repository: AuthRepository) {}

  async execute(
    name: string,
    email: string,
    password: string
  ): Promise<AuthUser> {
    // ✅ Validate raw password BEFORE hashing
    const passwordVO = new AuthUserPassword(password);

    // Check if user already exists
    const existingUser = await this.repository.findByEmail(
      new AuthUserEmail(email)
    );

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    //  FIX: Use configured salt rounds
    const hashedPassword = await bcrypt.hash(
      passwordVO.getValue(),
      config.bcryptSaltRounds
    );

    // Create user with hashed password
    const id = uuidv4();
    const user = new AuthUser(id, name, email, hashedPassword);

    return await this.repository.create(user);
  }
}