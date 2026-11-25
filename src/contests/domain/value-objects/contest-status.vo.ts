export type ContestStatusType = 'upcoming' | 'active' | 'past';

export class ContestStatus {
  constructor(private readonly value: ContestStatusType) {
    if (!['upcoming', 'active', 'past'].includes(value)) {
      throw new Error(`Invalid contest status: ${value}`);
    }
  }

  getValue(): ContestStatusType {
    return this.value;
  }

  isUpcoming(): boolean {
    return this.value === 'upcoming';
  }

  isActive(): boolean {
    return this.value === 'active';
  }

  isPast(): boolean {
    return this.value === 'past';
  }

  static upcoming(): ContestStatus {
    return new ContestStatus('upcoming');
  }

  static active(): ContestStatus {
    return new ContestStatus('active');
  }

  static past(): ContestStatus {
    return new ContestStatus('past');
  }

  static from(value: string): ContestStatus {
    return new ContestStatus(value as ContestStatusType);
  }
}
