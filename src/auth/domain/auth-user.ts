import { AuthUserId } from './auth-user-id';
import { AuthUserEmail } from './auth-user-email';
import { AuthUserName } from './auth-user-name';
import { AuthUserHashedPassword } from './auth-user-hashed-password';
import { AuthUserCreateAt } from './auth-user-create-at';

export class AuthUser {
  id: AuthUserId;
  name: AuthUserName;
  email: AuthUserEmail;
  password: AuthUserHashedPassword; //  FIX: Use hashed password VO
  createdAt: AuthUserCreateAt;

  constructor(
    id: string,
    name: string,
    email: string,
    hashedPassword: string, //  FIX: Make it explicit this is hashed
    createdAt?: Date
  ) {
    this.id = new AuthUserId(id);
    this.name = new AuthUserName(name);
    this.email = new AuthUserEmail(email);
    this.password = new AuthUserHashedPassword(hashedPassword);
    this.createdAt = new AuthUserCreateAt(createdAt ?? new Date());
  }

  public setHashedPassword(hashedPassword: AuthUserHashedPassword): void {
    this.password = hashedPassword;
  }

  public toJSON(): object {
    return {
      id: this.id.getValue(),
      name: this.name.getValue(),
      email: this.email.getValue(),
      createdAt: this.createdAt.getValue().toISOString(),
    };
  }

  public print(): void {
    console.log(
      `AuthUser [ID: ${this.id.getValue()}, Name: ${this.name.getValue()}, Email: ${this.email.getValue()}, Created At: ${this.createdAt.getValue().toISOString()}]`
    );
  }
}
