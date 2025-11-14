export class CourseId {
  private value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValidId();
  }

  private ensureIsValidId() {
    if (this.value.length === 0) {
      throw new Error('CourseId cannot be empty');
    }
    if (this.value.length > 36) {
      throw new Error('CourseId cannot be longer than 36 characters');
    }
  }

  public getValue(): string {
    return this.value;
  }
}
