import { UserRepository } from '../../domain/repository/user.repository';
import { User } from '../../domain/user';
import bcrypt from 'bcrypt';
import { config } from '@config';

export class RegisterUser {
  constructor(private repo: UserRepository) {}

  async execute(
    username: string,
    email: string,
    password: string
  ): Promise<void> {
    const user = new User(username, email, password);

    if (await this.repo.findByEmail(user.email.getValue()))
      throw new Error('Email already registered');
    if (await this.repo.findByUsername(user.username.getValue()))
      throw new Error('Username already taken');

    const hash = await bcrypt.hash(
      user.password.getValue(),
      config.JWT.saltRounds
    );
    await this.repo.register(
      user.username.getValue(),
      user.email.getValue(),
      hash
    );
  }
}
