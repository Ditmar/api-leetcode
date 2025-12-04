import { RefreshTokenId } from './refresh-token-id';
import { RefreshTokenToken } from './refresh-token-token';
import { AuthUserId } from './auth-user-id';
import { RefreshTokenExpiresAt } from './refresh-token-expires-at';
import { RefreshTokenCreatedAt } from './refresh-token-created-at';
import { RefreshTokenIsRevoked } from './refresh-token-is-revoked';

export class RefreshToken {
  id: RefreshTokenId;
  token: RefreshTokenToken;
  userId: AuthUserId;
  expiresAt: RefreshTokenExpiresAt;
  createdAt: RefreshTokenCreatedAt;
  isRevoked: RefreshTokenIsRevoked;

  constructor(
    id: string,
    token: string,
    userId: string,
    expiresAt: Date,
    createdAt?: Date,
    isRevoked: boolean = false
  ) {
    this.id = new RefreshTokenId(id);
    this.token = new RefreshTokenToken(token);
    this.userId = new AuthUserId(userId);
    this.expiresAt = new RefreshTokenExpiresAt(expiresAt);
    this.createdAt = new RefreshTokenCreatedAt(createdAt);
    this.isRevoked = new RefreshTokenIsRevoked(isRevoked);
  }

  public isValid(): boolean {
    return !this.isRevoked.getValue() && !this.expiresAt.isExpired();
  }

  public revoke(): void {
    this.isRevoked = new RefreshTokenIsRevoked(true);
  }

  public toJSON(): object {
    return {
      id: this.id.getValue(),
      token: this.token.getValue(),
      userId: this.userId.getValue(),
      expiresAt: this.expiresAt.getValue().toISOString(),
      createdAt: this.createdAt.getValue().toISOString(),
      isRevoked: this.isRevoked.getValue(),
    };
  }
}
