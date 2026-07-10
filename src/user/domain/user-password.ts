import * as bcrypt from 'bcrypt';

export class UserPassword {
  private readonly value: string;
  private readonly isHashed: boolean;

  constructor(value: string, isHashed: boolean = false) {
    this.isHashed = isHashed;

    if (isHashed) {
      this.value = value;
      this.ensureIsValidHash();
    } else {
      this.value = this.hashPassword(value);
      this.ensureIsValidPassword();
    }
  }

  private hashPassword(password: string): string {
    if (password.trim().length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }

    return bcrypt.hashSync(password, 10);
  }

  private ensureIsValidPassword(): void {
    if (this.value.trim().length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }
  }

  private ensureIsValidHash(): void {
    if (!this.value.match(/^\$2[aby]\$\d+\$.{53}$/)) {
      throw new Error('Invalid password hash format.');
    }
  }

  getValue(): string {
    return this.value;
  }

  verify(password: string): boolean {
    return bcrypt.compareSync(password, this.value);
  }

  static fromHash(hash: string): UserPassword {
    return new UserPassword(hash, true);
  }
}
