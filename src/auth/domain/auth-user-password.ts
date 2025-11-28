export class AuthUserPassword {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Password cannot be empty');
    }
    if (value.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }

  getValue(): string {
    return this.value;
  }
}