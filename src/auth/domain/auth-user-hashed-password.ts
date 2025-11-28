export class AuthUserHashedPassword {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Hashed password cannot be empty');
    }
    // Bcrypt hashes are always 60 characters
    if (value.length < 50) {
      throw new Error('Invalid hashed password format');
    }
  }

  getValue(): string {
    return this.value;
  }
}