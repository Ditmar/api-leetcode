export interface AuthRepository {
  login(username: string, password: string): Promise<string>;
  register(username: string, password: string, email: string): Promise<string>;
}
