export class AlreadyEnrolledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlreadyEnrolledError';
  }
}
