import { AuthUser } from '../auth-user';
import { AuthUserEmail } from '../auth-user-email';
import { AuthUserId } from '../auth-user-id';

export interface AuthRepository {
  create(user: AuthUser): Promise<AuthUser>;
  findByEmail(email: AuthUserEmail): Promise<AuthUser | null>;
  findById(id: AuthUserId): Promise<AuthUser | null>;
}
