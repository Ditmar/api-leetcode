import { ValidationError } from './errors/validation-error';
export class AuthUserPassword {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new ValidationError('Password cannot be empty');
    }
    if (value.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long'); //added requeriments from ticket 8 characters
    }
  }

  getValue(): string {
    return this.value;
  }
}
