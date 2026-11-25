export class Difficulty {
  private static readonly VALID_VALUES = ['EASY', 'MEDIUM', 'HARD'] as const;

  constructor(private readonly value: 'EASY' | 'MEDIUM' | 'HARD') {
    if (!Difficulty.VALID_VALUES.includes(value)) {
      throw new Error(
        `Invalid difficulty: ${value}. Must be EASY, MEDIUM or HARD`
      );
    }
  }

  getValue(): 'EASY' | 'MEDIUM' | 'HARD' {
    return this.value;
  }

  static isValid(value: string): value is 'EASY' | 'MEDIUM' | 'HARD' {
    return Difficulty.VALID_VALUES.includes(
      value as 'EASY' | 'MEDIUM' | 'HARD'
    );
  }
}
