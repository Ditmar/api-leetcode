import { Request } from 'express';
interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    username: string;
    password: string;
    email: string;
  };
}

export { LoginRequest, RegisterRequest };
