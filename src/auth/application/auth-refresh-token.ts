import { AuthRepository } from 'auth/domain/repository/auth-repository';

export class AuthRefreshToken {
    constructor(private repository: AuthRepository) {}
    async execute(token: string): Promise<string> {
        return this.repository.refreshToken(token);
    }
}