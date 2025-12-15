export class AuthUserName {
  private readonly value: string;

  constructor(name: string) {
    const normalized = name.trim().toLowerCase();

    if (!normalized || normalized === '') {
      throw new Error('User name cannot be empty');
    }
    if (normalized.length < 3) {
      throw new Error('User name must be at least 3 characters long');
    }

    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }
}
