export class EnrollmentId {
  private value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValidEnrollmentId();
  }

  private ensureIsValidEnrollmentId() {
    if (this.value.length === 0) {
      throw new Error('EnrollmentId cannot be empty');
    }
  }

  public getValue(): string {
    return this.value;
  }
}
