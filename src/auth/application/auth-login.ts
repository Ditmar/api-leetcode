import { AuthRepository } from 'auth/domain/repository/auth-repository';

export class AuthLogin {
    constructor(private repository: AuthRepository) {}

    async execute(nickname: string, password: string): Promise<string> {
        return this.repository.login(nickname, password);

    }
}