import { Request } from 'express';
export interface MyLoginRequest extends Request {
    body : {
        nickname: string;
        password: string;
    }
}