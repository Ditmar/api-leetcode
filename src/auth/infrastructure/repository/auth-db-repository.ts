import { AuthRepository } from '../../domain/repository/auth-repository';
import { PrismaClient } from '@db';
import jwt, { JwtPayload } from 'jsonwebtoken';

export class AuthDbRepository implements AuthRepository {
    private prisma: PrismaClient;
    constructor () {
        this.prisma = new PrismaClient();
        
    }
    async login(nickname: string, password: string): Promise<string> {
        console.log('nick name ', nickname)
        console.log('password ', password)
        const user = await this.prisma.auth.findUnique({
            where: { nickname, password }
        });
        if (user === null) {
            throw new Error('Invalid credentials');
        }
        if (process.env.JWT_SECRET === undefined || process.env.JWT_EXPIRES_IN === undefined) {
            throw new Error('JWT configuration is missing');
        }
        const expires = parseInt(process.env.JWT_EXPIRES_IN, 10);
        const token = jwt.sign({ nickname: user.nickname, customerId: user.id }, process.env.JWT_SECRET, { expiresIn: expires });
        return Promise.resolve(token)
    }
    register(nickname: string, password: string, email: string): Promise<void> {
        console.log('Registering user in DB:', nickname, email);
        console.log('password ', password)
        return this.prisma.auth.create({
            data: { nickname, password, email }
        }).then(() => Promise.resolve());
    }
    refreshToken(token: string): Promise<string> {
        if (process.env.JWT_SECRET === undefined || process.env.JWT_EXPIRES_IN === undefined) {
            throw new Error('JWT configuration is missing');
        }
        let payload: JwtPayload | string;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            throw new Error('Invalid token');
        }
        const expires = parseInt(process.env.JWT_EXPIRES_IN, 10);
        const newToken = jwt.sign({ nickname: (payload as JwtPayload).nickname, customerId: (payload as JwtPayload).customerId }, process.env.JWT_SECRET, { expiresIn: expires });
        return Promise.resolve(newToken);
    }
}