export interface UserRepository {
  register(
    username: string,
    email: string,
    hashedPassword: string
  ): Promise<void>;
  findByEmail(email: string): Promise<{
    id: number;
    username: string;
    email: string;
    passwordHash: string;
  } | null>;
  findByUsername(username: string): Promise<{
    id: number;
    username: string;
    email: string;
    passwordHash: string;
  } | null>;
  issueToken(user: {
    id: number;
    username: string;
    email: string;
  }): Promise<string>;
}
