import { UserPassword } from './user-password';

export class User {
  private id: string;
  private nickName: string;
  private password: UserPassword;
  private email: string;

  constructor(id: string, nickName: string, password: string, email: string) {
    this.id = id;
    this.nickName = nickName;
    this.password = new UserPassword(password);
    this.email = email;
  }
  getId(): string {
    return this.id;
  }
  getNickName(): string {
    return this.nickName;
  }
  getEmail(): string {
    return this.email;
  }
  getPassword(): string {
    return this.password.getValue();
  }
}
