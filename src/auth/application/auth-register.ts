import { AuthRepository } from "auth/domain/repository/auth-repository";

export class AuthRegister {
    constructor(private repository: AuthRepository) {}
    async execute(nickname: string, password: string, email: string): Promise<void> {
        return this.repository.register(nickname, password, email);
    }
}