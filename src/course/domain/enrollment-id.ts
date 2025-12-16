export class EnrollmentId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Enrollment ID cannot be empty');
    }
  }

  getValue(): string {
    return this.value;
  }
}
