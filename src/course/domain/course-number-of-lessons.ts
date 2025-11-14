export class CourseNumberOfLessons {
  private value: number;

  constructor(value: number) {
    this.value = value;
    this.ensureIsValidNumberOfLessons();
  }

  private ensureIsValidNumberOfLessons() {
    if (this.value < 1) {
      throw new Error('Number of lessons must be at least 1');
    }
    if (this.value > 200) {
      throw new Error('Number of lessons cannot exceed 200');
    }
  }

  public getValue(): number {
    return this.value;
  }
}
