export class UserPassword {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValidPassword();
  }

  private ensureIsValidPassword(): void {
    if (this.value.trim().length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }
  }

  getValue(): string {
    return this.value;
  }
}
