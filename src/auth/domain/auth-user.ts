import { AuthUserId } from './auth-user-id';
import { AuthUserEmail } from './auth-user-email';
import { AuthUserName } from './auth-user-name';
import { AuthUserPassword } from './auth-user-password';
import { AuthUserCreateAt } from './auth-user-create-at';

export class AuthUser {
  id: AuthUserId;
  name: AuthUserName;
  email: AuthUserEmail;
  password: AuthUserPassword;
  createdAt: AuthUserCreateAt;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt?: Date
  ) {
    this.id = new AuthUserId(id);
    this.name = new AuthUserName(name);
    this.email = new AuthUserEmail(email);
    this.password = new AuthUserPassword(password);
    this.createdAt = new AuthUserCreateAt(createdAt ?? new Date());
  }

  public setPassword(password: AuthUserPassword): void {
    this.password = password;
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