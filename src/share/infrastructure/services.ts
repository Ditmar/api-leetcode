import { UserCreate } from '../../user/application/user-create/user-create';
import { UserDelete } from '../../user/application/user-delete.ts/user-delete';
import { UserEdit } from '../../user/application/user-edit/user-edit';
import { UserGetAll } from '../../user/application/user-get-all/user-get-all';
import { UserGetById } from '../../user/application/user-get-by-id/user-get-by-id';
import { UserMockRepository } from '../../user/infrastructure/repository/user-mock-repository';

import { CourseCreate } from '../../course/application/course-create/course-create';
import { CourseGetAll } from '../../course/application/course-get-all/course-get-all';
import { CourseGetById } from '../../course/application/course-get-by-id/course-get-by-id';
import { CourseEnroll } from '../../course/application/course-enroll/course-enroll';
import { CourseGetByUser } from '../../course/application/course-get-by-user/course-get-by-user';
import { CourseMockRepository } from '../../course/infrastructure/repository/course-mock-repository';
import { EnrollmentMockRepository } from '../../course/infrastructure/repository/enrollment-mock-repository';

const userRepository = new UserMockRepository();
const courseRepository = new CourseMockRepository();
const enrollmentRepository = new EnrollmentMockRepository();

export const services = {
  user: {
    getAll: new UserGetAll(userRepository),
    getById: new UserGetById(userRepository),
    create: new UserCreate(userRepository),
    update: new UserEdit(userRepository),
    delete: new UserDelete(userRepository),
  },
  course: {
    getAll: new CourseGetAll(courseRepository),
    getById: new CourseGetById(courseRepository),
    create: new CourseCreate(courseRepository),
    enroll: new CourseEnroll(courseRepository, enrollmentRepository),
    getByUser: new CourseGetByUser(enrollmentRepository, courseRepository),
  },
};
