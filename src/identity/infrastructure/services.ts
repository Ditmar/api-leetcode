import { RegisterUser } from '../application/register/register-user';
import { LoginUser } from '../application/login/login-user';
import { UserPrismaRepository } from '../infrastructure/repository/user-prisma-repository';

const userRepo = new UserPrismaRepository();

export const services = {
  identity: {
    register: new RegisterUser(userRepo),
    login: new LoginUser(userRepo),
  },
};
