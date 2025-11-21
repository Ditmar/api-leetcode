import { AuthEmail } from "./auth-email";
import { AuthId } from "./auth-id";
import { AuthPassword } from "./auth-password";
import { AuthUserName } from "./auth-username";

export class Auth {
    id: AuthId;
    nickname: AuthUserName;
    password: AuthPassword;
    email: AuthEmail;
    constructor(id: number , nickname: string, password: string, email: string) {
        this.id = new AuthId(id);
        this.nickname = new AuthUserName(nickname);
        this.password = new AuthPassword(password);
        this.email = new  AuthEmail(email)
    }
    public getId(): AuthId {
        return this.id;
    }
    public getNickname(): AuthUserName {
        return this.nickname;
    }
    public getPassword(): AuthPassword {
        return this.password;
    }
    public getEmail(): AuthEmail {
        return this.email;
    }
}