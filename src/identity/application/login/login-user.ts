import { UserRepository } from '../../domain/repository/user.repository';
import bcrypt from 'bcrypt';

export class LoginUser {
  constructor(private repo: UserRepository) {}

  async execute(
    email: string,
    password: string
  ): Promise<{ access_token: string; token_type: 'Bearer' }> {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');

    const token = await this.repo.issueToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    return { access_token: token, token_type: 'Bearer' };
  }
}
