export class CourseDescription {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Course description cannot be empty');
    }
    if (value.length > 1000) {
      throw new Error('Course description cannot exceed 1000 characters');
    }
  }
  getValue(): string {
    return this.value;
  }
}
