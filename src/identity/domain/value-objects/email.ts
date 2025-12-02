export class Email {
  private readonly value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureValid();
  }
  private ensureValid() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(this.value)) throw new Error('Invalid email format');
  }
  getValue() {
    return this.value;
  }
}
