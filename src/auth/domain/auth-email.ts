export class AuthEmail {
    private readonly value: string;
    constructor(value: string) {
        this.value = value;
        this.ensureIsValid();
    }
    private ensureIsValid() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            throw new Error('Invalid email format');
        }
    }
    public getValue(): string {
        return this.value;
    }
}