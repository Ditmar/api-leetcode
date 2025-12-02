export class EnrollmentId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Enrollment ID cannot be empty');
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid Enrollment ID format');
    }
  }
  getValue(): string {
    return this.value;
  }
}
