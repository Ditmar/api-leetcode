import { services } from '../../../share/infrastructure/services';
import { Request, Response } from 'express';
import { MyLoginRequest } from './type/LoginRequest';
import logger from '@logger';
export class AuthController {
    constructor() {}
    async login(req: MyLoginRequest, res: Response): Promise<void> {
        const { nickname, password } = req.body;
        try {
            const token = await services.auth.login.execute(nickname, password);
            res.status(200).json({ token });
        } catch (error) {
            logger.error(`Login failed ${error}`, );
            res.status(401).json({ message: 'Invalid credentials' });
        }
        
    }
    async register(req: Request, res: Response): Promise<void> {
        const { nickname, password, email } = req.body;
        await services.auth.register.execute(nickname, password, email);
        res.status(201).json({ message: 'User registered successfully' });
    }
    async refreshToken(req: Request, res: Response): Promise<void> {
        const { token } = req.body;
    }
}