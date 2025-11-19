import { AuthRepository } from 'auth/domain/repository/auth-repository';

export class AuthRegister {
  constructor(private repository: AuthRepository) {}

  async execute(
    username: string,
    password: string,
    email: string
  ): Promise<string> {
    await this.repository.register(username, password, email);
    return 'User registered successfully';
  }
}
