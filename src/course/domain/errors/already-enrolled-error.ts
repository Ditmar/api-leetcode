export class AlreadyEnrolledError extends Error {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} is already enrolled in course ${courseId}`);
    this.name = 'AlreadyEnrolledError';
  }
}
