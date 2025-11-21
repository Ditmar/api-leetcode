export class AuthUserName {
    private readonly value: string;
    constructor(value: string) {
        this.value = value;
        this.ensureIsValid();
    }
    private ensureIsValid() {
        if (this.value.length < 3 || this.value.length > 20) {
            throw new Error('Username must be between 3 and 20 characters long');
        }
    }
    public getValue(): string {
        return this.value;
    }
}