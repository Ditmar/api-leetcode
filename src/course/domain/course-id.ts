export class CourseId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Course ID cannot be empty');
    }
  }

  getValue(): string {
    return this.value;
  }
}
