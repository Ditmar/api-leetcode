import { Router } from 'express';
import { ExpressUserController } from '../controller/express-user-controller';
const userController = new ExpressUserController();
const userRoutes = Router();

userRoutes.get('/', (req, res) => userController.getAllUsers(req, res));
userRoutes.get('/:id', (req, res) => userController.getUserById(req, res));
userRoutes.post('/', (req, res) => userController.createUser(req, res));
userRoutes.put('/:id', (req, res) => userController.updateUser(req, res));
userRoutes.delete('/:id', (req, res) => userController.deleteUser(req, res));

export { userRoutes };
