// ============================================
// IMPORTS EXISTENTES (User & Auth)
// ============================================
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
import { RefreshTokenPrismaRepository } from '../../auth/infrastructure/repository/refresh-token-prisma-repository';
import { prisma } from './prisma-client';

// ============================================
// NUEVOS IMPORTS (Tests)
// ============================================
import { TestPrismaRepository } from '../../tests/infraestructure/repository/TestPrismaRepository';
import { GetTestsUseCase } from '../../tests/application/get-tests/GetTestsUseCase';
import { GetTestByIdUseCase } from '../../tests/application/get-test-by-id/GetTestByIdUseCase';
import { StartTestUseCase } from '../../tests/application/start-test/StartTestUseCase';
import { GetQuestionsUseCase } from '../../tests/application/get-questions/GetQuestionsUseCase';
import { SubmitTestUseCase } from '../../tests/application/submit-test/SubmitTestUseCase';

// ============================================
// REPOSITORIES
// ============================================
const userRepository = new UserMockRepository();
const authRepository = new AuthPrismaRepository(prisma);
const refreshTokenRepository = new RefreshTokenPrismaRepository(prisma);
const testRepository = new TestPrismaRepository(prisma);

import { CourseCreate } from '../../course/application/course-create/course-create';
import { CourseGetAll } from '../../course/application/course-get-all/course-get-all';
import { CourseGetById } from '../../course/application/course-get-by-id/course-get-by-id';
import { CourseEnroll } from '../../course/application/course-enroll/course-enroll';
import { CourseGetByUser } from '../../course/application/course-get-by-user/course-get-by-user';
import { CourseMockRepository } from '../../course/infrastructure/repository/course-mock-repository';
import { EnrollmentMockRepository } from '../../course/infrastructure/repository/enrollment-mock-repository';

const courseRepository = new CourseMockRepository();
const enrollmentRepository = new EnrollmentMockRepository();

// ============================================
// EXPORT SERVICES
// ============================================
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
    login: new AuthLogin(authRepository, refreshTokenRepository),
    getMe: new AuthGetMe(authRepository),
  },
  tests: {
    getAll: new GetTestsUseCase(testRepository),
    getById: new GetTestByIdUseCase(testRepository),
    start: new StartTestUseCase(testRepository),
    getQuestions: new GetQuestionsUseCase(testRepository),
    submit: new SubmitTestUseCase(testRepository),
  },
  course: {
    getAll: new CourseGetAll(courseRepository),
    getById: new CourseGetById(courseRepository),
    create: new CourseCreate(courseRepository),
    enroll: new CourseEnroll(courseRepository, enrollmentRepository),
    getByUser: new CourseGetByUser(enrollmentRepository, courseRepository),
  },
};
