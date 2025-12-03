import { AuthUser } from '../auth-user';
import { AuthUserEmail } from '../auth-user-email';
import { AuthUserId } from '../auth-user-id';
import { AuthUserName } from '../auth-user-name';

export interface AuthRepository {
  create(user: AuthUser): Promise<AuthUser>;
  findByName(name: AuthUserName): Promise<AuthUser | null>; //added to username unique
  findByEmail(email: AuthUserEmail): Promise<AuthUser | null>;
  findById(id: AuthUserId): Promise<AuthUser | null>;
}
