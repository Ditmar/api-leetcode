export class AuthUserCreateAt {
  constructor(private readonly value: Date) {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error('Invalid date');
    }
  }

  getValue(): Date {
    return this.value;
  }
}
