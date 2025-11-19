import { UserCreate } from '../../user/application/user-create/user-create';
import { UserDelete } from '../../user/application/user-delete.ts/user-delete';
import { UserEdit } from '../../user/application/user-edit/user-edit';
import { UserGetAll } from '../../user/application/user-get-all/user-get-all';
import { UserGetById } from '../../user/application/user-get-by-id/user-get-by-id';
import { UserMockRepository } from '../../user/infrastructure/repository/user-mock-repository';
import { AuthJSONRepository } from '../../auth/infrastructure/repository/auth-repository';
import { AuthLogin } from 'auth/application/auth-login';
import { AuthLogout } from 'auth/application/auth-logout';
import { AuthRefresh } from 'auth/application/auth-refresh';
import { AuthRegister } from 'auth/application/auth-register';

export const authRepository = new AuthJSONRepository();

const userRepository = new UserMockRepository();

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
    logout: new AuthLogout(authRepository),
    refresh: new AuthRefresh(authRepository),
    register: new AuthRegister(authRepository),
  },
};
