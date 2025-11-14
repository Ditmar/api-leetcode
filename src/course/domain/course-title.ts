export class CourseTitle {
  private value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValidTitle();
  }

  private ensureIsValidTitle() {
    if (this.value.length < 3) {
      throw new Error('Course title must be at least 3 characters long');
    }
    if (this.value.length > 100) {
      throw new Error('Course title cannot be longer than 100 characters');
    }
  }

  public getValue(): string {
    return this.value;
  }
}
