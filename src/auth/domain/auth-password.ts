export class AuthPassword {
    private readonly value: string;
    constructor(value: string) {
        this.value = value;
        this.ensureIsValid();
    }
    private ensureIsValid() {
        if (this.value.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(this.value)) {
            throw new Error('Password must contain at least one uppercase letter');
        }   
        if (!/[a-z]/.test(this.value)) {
            throw new Error('Password must contain at least one lowercase letter');
        }  
        if (!/[0-9]/.test(this.value)) {
            throw new Error('Password must contain at least one digit');
        }
    }
    public getValue(): string {
        return this.value;
    }   
}