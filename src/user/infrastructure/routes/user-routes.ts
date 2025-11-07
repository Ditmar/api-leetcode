import { Router } from 'express';
import { ExpressUserController } from '../controller/express-user-controller';
const userController = new ExpressUserController();
const userRoutes = Router();
userRoutes.get('/', userController.getAllUsers);
userRoutes.get('/:id', userController.getUserById);
userRoutes.post('/', userController.createUser);
userRoutes.put('/:id', userController.updateUser);
userRoutes.delete('/:id', userController.deleteUser);

export { userRoutes };
