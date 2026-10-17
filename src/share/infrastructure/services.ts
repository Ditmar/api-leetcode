// ============================================
// IMPORTS EXISTENTES (Auth)
// ============================================

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

import { CoursePrismaRepository } from '../../course/infrastructure/repository/course-prisma-repository';
import { EnrollmentPrismaRepository } from '../../course/infrastructure/repository/enrollment-prisma-repository';
import { CourseGetAll } from '../../course/application/course-get-all/course-get-all';
import { CourseGetById } from '../../course/application/course-get-by-id/course-get-by-id';
import { CourseEnroll } from '../../course/application/course-enroll/course-enroll';
import { CourseGetByUser } from '../../course/application/course-get-by-user/course-get-by-user';

// ============================================
// REPOSITORIES
// ============================================
const authRepository = new AuthPrismaRepository(prisma);
const refreshTokenRepository = new RefreshTokenPrismaRepository(prisma);
const testRepository = new TestPrismaRepository(prisma);
const courseRepository = new CoursePrismaRepository(prisma);
const enrollmentRepository = new EnrollmentPrismaRepository(prisma);

// ============================================
// EXPORT SERVICES
// ============================================
export const services = {
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
    enroll: new CourseEnroll(enrollmentRepository),
    getByUser: new CourseGetByUser(enrollmentRepository, courseRepository),
  },
};
