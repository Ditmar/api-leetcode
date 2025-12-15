import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUserId } from '../../domain/auth-user-id';
import { UserNotFoundError } from '../../domain/errors/auth-errors';

export interface GetMeResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export class AuthGetMe {
  constructor(private repository: AuthRepository) {}

  async execute(userId: string): Promise<GetMeResponse> {
    const user = await this.repository.findById(new AuthUserId(userId));

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return {
      id: user.id.getValue(),
      name: user.name.getValue(),
      email: user.email.getValue(),
      createdAt: user.createdAt.getValue().toISOString(),
    };
  }
}
