export class UserCreateAt {
  private value: Date;
  constructor(value: Date) {
    this.value = value;
    this.ensureIsValidDate();
  }
  private ensureIsValidDate(): void {
    if (isNaN(this.value.getTime())) {
      throw new Error('Invalid date');
    }
  }
  getValue(): Date {
    return this.value;
  }
}
