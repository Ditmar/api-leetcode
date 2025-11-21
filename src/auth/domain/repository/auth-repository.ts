export interface AuthRepository {
    login(nickname: string, password: string): Promise<string>;
    register(nickname: string, password: string, email: string): Promise<void>;
    refreshToken(token: string): Promise<string>;
}