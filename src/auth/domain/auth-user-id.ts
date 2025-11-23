export class AuthUserId {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
  }

  getValue(): string {
    return this.value;
  }
}