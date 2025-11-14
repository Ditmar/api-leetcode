export class CourseDescription {
  private value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValidDescription();
  }

  private ensureIsValidDescription() {
    if (this.value.length < 10) {
      throw new Error('Course description must be at least 10 characters long');
    }
  }

  public getValue(): string {
    return this.value;
  }
}
