export class Password {
  private readonly value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureValid();
  }
  private ensureValid() {
    if (this.value.length < 8)
      throw new Error('Password must be at least 8 characters');
  }
  getValue() {
    return this.value;
  }
}
