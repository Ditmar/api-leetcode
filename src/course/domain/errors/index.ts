export class CourseNotFoundError extends Error {
  constructor(id: string) {
    super(`Course with ID ${id} not found`);
    this.name = 'CourseNotFoundError';
  }
}

export class AlreadyEnrolledError extends Error {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} is already enrolled in course ${courseId}`);
    this.name = 'AlreadyEnrolledError';
  }
}
