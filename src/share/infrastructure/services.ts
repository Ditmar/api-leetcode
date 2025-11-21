import { AuthLogin, AuthRefreshToken, AuthRegister } from 'auth/application';
import { UserCreate } from '../../user/application/user-create/user-create';
import { UserDelete } from '../../user/application/user-delete.ts/user-delete';
import { UserEdit } from '../../user/application/user-edit/user-edit';
import { UserGetAll } from '../../user/application/user-get-all/user-get-all';
import { UserGetById } from '../../user/application/user-get-by-id/user-get-by-id';
import { UserMockRepository } from '../../user/infrastructure/repository/user-mock-repository';
import { AuthDbRepository } from 'auth/infrastructure/repository/auth-db-repository';

const userRepository = new UserMockRepository();
const authRepository = new AuthDbRepository();

export const services = {
  user: {
    getAll: new UserGetAll(userRepository),
    getById: new UserGetById(userRepository),
    create: new UserCreate(userRepository),
    update: new UserEdit(userRepository),
    delete: new UserDelete(userRepository),
  },
  auth: {
    login: new AuthLogin(authRepository),
    register: new AuthRegister(authRepository),
    refreshToken: new AuthRefreshToken(authRepository),
  }
};
