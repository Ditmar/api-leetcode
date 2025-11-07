import { UserCreateAt } from './user-create-at';
import { UserEmail } from './user-email';
import { UserId } from './user-id';
import { UserName } from './user-name';

export class User {
  id: UserId;
  name: UserName;
  email: UserEmail;
  createdAt: UserCreateAt;

  constructor(id: string, name: string, email: string) {
    this.id = new UserId(id);
    this.name = new UserName(name);
    this.email = new UserEmail(email);
    this.createdAt = new UserCreateAt(new Date());
  }
  public setName(name: UserName): void {
    this.name = name;
  }
  public setEmail(email: UserEmail): void {
    this.email = email;
  }
  public print(): void {
    console.log(
      `User [ID: ${this.id.getValue()}, Name: ${this.name.getValue()}, Email: ${this.email.getValue()}, Created At: ${this.createdAt.getValue().toISOString()}]`
    );
  }
  public getEmailAndName(): string {
    return `Name: ${this.name.getValue()}, Email: ${this.email.getValue()}`;
  }
}
