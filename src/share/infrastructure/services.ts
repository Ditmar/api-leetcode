import { UserCreate } from '../../user/application/user-create/user-create';
import { UserDelete } from '../../user/application/user-delete.ts/user-delete';
import { UserEdit } from '../../user/application/user-edit/user-edit';
import { UserGetAll } from '../../user/application/user-get-all/user-get-all';
import { UserGetById } from '../../user/application/user-get-by-id/user-get-by-id';
import { UserMockRepository } from '../../user/infrastructure/repository/user-mock-repository';

import { AuthGetMe } from '../../auth/application/auth-get-me/auth-get-me';
import { AuthLogin } from '../../auth/application/auth-login/auth-login';
import { AuthSignup } from '../../auth/application/auth-signup/auth-signup';
import { AuthPrismaRepository } from '../../auth/infrastructure/repository/auth-prisma-repository';
import { prisma } from './prisma-client';

const userRepository = new UserMockRepository();
const authRepository = new AuthPrismaRepository(prisma);

export const services = {
  user: {
    getAll: new UserGetAll(userRepository),
    getById: new UserGetById(userRepository),
    create: new UserCreate(userRepository),
    update: new UserEdit(userRepository),
    delete: new UserDelete(userRepository),
  },
  auth: {
    signup: new AuthSignup(authRepository),
    login: new AuthLogin(authRepository),
    getMe: new AuthGetMe(authRepository),
  },
};
