export class UserEmail {
  private value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureIsValidEmail();
  }
  private ensureIsValidEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('Invalid email format');
    }
  }
  getValue(): string {
    return this.value;
  }
}
