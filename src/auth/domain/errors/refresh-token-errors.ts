export class RefreshTokenNotFoundError extends Error {
  constructor(message: string = 'Refresh token not found') {
    super(message);
    this.name = 'RefreshTokenNotFoundError';
  }
}

export class RefreshTokenExpiredError extends Error {
  constructor(message: string = 'Refresh token has expired') {
    super(message);
    this.name = 'RefreshTokenExpiredError';
  }
}

export class RefreshTokenRevokedError extends Error {
  constructor(message: string = 'Refresh token has been revoked') {
    super(message);
    this.name = 'RefreshTokenRevokedError';
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor(message: string = 'Invalid refresh token') {
    super(message);
    this.name = 'InvalidRefreshTokenError';
  }
}
