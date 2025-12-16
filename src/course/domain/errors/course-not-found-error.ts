export class CourseNotFoundError extends Error {
  constructor(id: string) {
    super(`Course with ID ${id} not found`);
    this.name = 'CourseNotFoundError';
  }
}
