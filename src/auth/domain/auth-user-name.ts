export class AuthUserName {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('User name cannot be empty');
    }
    if (value.length < 3) {
      throw new Error('User name must be at least 3 characters long');
    }
  }

  getValue(): string {
    return this.value;
  }
}
