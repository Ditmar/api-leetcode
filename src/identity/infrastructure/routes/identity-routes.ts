import { Router } from 'express';
import { IdentityController } from '../controller/identity-controller';

const controller = new IdentityController();
const identityRoutes = Router();

identityRoutes.post('/register', (req, res) => controller.register(req, res));
identityRoutes.post('/login', (req, res) => controller.login(req, res));

export { identityRoutes };
