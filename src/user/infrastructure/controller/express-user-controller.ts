import { services } from '../../../share/infrastructure/services';
import { Request, Response } from 'express';

export class ExpressUserController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    console.log('test');
    const users = await services.user.getAll.execute();
    res.status(200).json(users);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await services.user.getById.execute(req.params.id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ error: 'User not found' + err });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const newUser = await services.user.create.execute(
      req.body.id,
      req.body.name,
      req.body.email
    );
    res.status(201).json(newUser);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const updatedUser = await services.user.update.execute(
        req.params.id,
        req.body
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(404).json({ error: 'User not found' + err });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await services.user.delete.execute(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: 'User not found' + err });
    }
  }
}
