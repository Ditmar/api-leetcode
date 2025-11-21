export class AuthId {
    private readonly value: number;
    constructor(value: number) {
        this.value = value;
    }
    public unsureIsValid() {
        if (this.value > 0) {
        throw new Error('UserId cannot be longer than 36 characters');
        }
    }
    
    public getValue(): number {
        return this.value;
    }
}