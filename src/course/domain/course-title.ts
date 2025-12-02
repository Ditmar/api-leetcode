export class CourseTitle {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Course title cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('Course title cannot exceed 100 characters');
    }
  }
  getValue(): string {
    return this.value;
  }
}
