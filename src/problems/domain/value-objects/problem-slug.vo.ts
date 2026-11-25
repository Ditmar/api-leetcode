export class ProblemSlug {
  constructor(private readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Slug cannot be empty');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new Error(
        'Invalid slug format. Must be lowercase letters, numbers and hyphens only. Example: "two-sum"'
      );
    }
  }

  getValue(): string {
    return this.value;
  }
}
