import { config } from '@config';
import bcrypt from 'bcrypt';
const { v4: uuidv4 } = require('uuid');
import { AuthUser } from '../../domain/auth-user';
import { AuthUserName } from '../../domain/auth-user-name';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { AuthUserPassword } from '../../domain/auth-user-password';
import { UserAlreadyExistsError } from '../../domain/errors/auth-errors';
import { AuthRepository } from '../../domain/repository/auth-repository';

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
      config.JWT.saltRounds
    );
    //To valid username is unic
    const existingUserByName = await this.repository.findByName(
      new AuthUserName(name)
    );
    if (existingUserByName) {
      throw new UserAlreadyExistsError(name);
    }

    // Create user with hashed password
    const id = uuidv4();
    const user = new AuthUser(id, name, email, hashedPassword);

    return await this.repository.create(user);
  }
}
