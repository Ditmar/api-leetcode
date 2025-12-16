export class CourseNumberOfLessons {
  constructor(private readonly value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('Number of lessons must be a positive integer');
    }
  }
  getValue(): number {
    return this.value;
  }
}
