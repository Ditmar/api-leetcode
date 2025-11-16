import { UserCreate } from '../../user/application/user-create/user-create';
import { UserDelete } from '../../user/application/user-delete.ts/user-delete';
import { UserEdit } from '../../user/application/user-edit/user-edit';
import { UserGetAll } from '../../user/application/user-get-all/user-get-all';
import { UserGetById } from '../../user/application/user-get-by-id/user-get-by-id';
import { UserMockRepository } from '../../user/infrastructure/repository/user-mock-repository';

import { GetTestsUseCase } from '../../tests/application/get-tests/GetTestsUseCase';
import { GetTestByIdUseCase } from '../../tests/application/get-test-by-id/GetTestByIdUseCase';
import { StartTestUseCase } from '../../tests/application/start-test/StartTestUseCase';
import { GetQuestionsUseCase } from '../../tests/application/get-questions/GetQuestionsUseCase';
import { SubmitTestUseCase } from '../../tests/application/submit-test/SubmitTestUseCase';
import { TestPrismaRepository } from '../../tests/infraestructure/repository/TestPrismaRepository';
import { getPrismaClient } from './prisma';

const userRepository = new UserMockRepository();
const testRepository = new TestPrismaRepository(getPrismaClient());

export const services = {
  user: {
    getAll: new UserGetAll(userRepository),
    getById: new UserGetById(userRepository),
    create: new UserCreate(userRepository),
    update: new UserEdit(userRepository),
    delete: new UserDelete(userRepository),
  },
  tests: {
    getAll: new GetTestsUseCase(testRepository),
    getById: new GetTestByIdUseCase(testRepository),
    start: new StartTestUseCase(testRepository),
    getQuestions: new GetQuestionsUseCase(testRepository),
    submit: new SubmitTestUseCase(testRepository),
  },
};
