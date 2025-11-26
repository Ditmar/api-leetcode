export class CourseId {
  private value: string;

  constructor(value: string) {
    this.value = value;
    if (value.length > 0) {
      this.ensureIsValidId();
    }
  }

  private ensureIsValidId() {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(this.value)) {
      throw new Error('CourseId must be a valid UUID');
    }
  }

  public getValue(): string {
    return this.value;
  }
}
