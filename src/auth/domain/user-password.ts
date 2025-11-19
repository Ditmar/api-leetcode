export class UserPassword {
  private value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureIsValidPassword();
  }
  private ensureIsValidPassword(): void {
    if (this.value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }
  getValue(): string {
    return this.value;
  }
}
