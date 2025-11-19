import { AuthRepository } from 'auth/domain/repository/auth-repository';

export class AuthLogin {
  constructor(private repository: AuthRepository) {}

  async execute(username: string, password: string): Promise<string> {
    const token = await this.repository.login(username, password);
    return token;
  }
}
