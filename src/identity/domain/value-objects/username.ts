export class Username {
  private readonly value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureValid();
  }
  private ensureValid() {
    if (this.value.length < 3 || this.value.length > 20)
      throw new Error('Username must be between 3 and 20 characters');
  }
  getValue() {
    return this.value;
  }
}
