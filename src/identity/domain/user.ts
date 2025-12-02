import { Email } from './value-objects/email';
import { Username } from './value-objects/username';
import { Password } from './value-objects/password';

export class User {
  readonly username: Username;
  readonly email: Email;
  readonly password: Password;

  constructor(username: string, email: string, password: string) {
    this.username = new Username(username);
    this.email = new Email(email);
    this.password = new Password(password);
  }
}
