import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';

export class UserCreate {
  constructor(private repository: UserRepository) {}

  async execute(
    id: string,
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    const user = new User(id, name, email, password);
    return this.repository.create(user);
  }
}
