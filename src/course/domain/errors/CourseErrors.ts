export class CourseNotFoundError extends Error {
  constructor(id: string) {
    super(`Course with ID ${id} not found`);
    this.name = 'CourseNotFoundError';
  }
}

export class UserAlreadyEnrolledError extends Error {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} is already enrolled in course ${courseId}`);
    this.name = 'UserAlreadyEnrolledError';
  }
}

export class EnrollmentNotFoundError extends Error {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} is not enrolled in course ${courseId}`);
    this.name = 'EnrollmentNotFoundError';
  }
}
