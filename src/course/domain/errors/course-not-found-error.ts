export class CourseNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CourseNotFoundError';
  }
}
