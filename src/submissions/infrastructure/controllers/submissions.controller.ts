import type { Request, Response } from 'express';
import type { CreateSubmissionUseCase } from '../../application/use-cases/create-submission.use-case';
import type { GetSubmissionByIdUseCase } from '../../application/use-cases/get-submission-by-id.use-case';
import type { GetSubmissionsByUserUseCase } from '../../application/use-cases/get-submissions-by-user.use-case';

export class SubmissionsController {
  constructor(
    private readonly createSubmission: CreateSubmissionUseCase,
    private readonly getSubmissionById: GetSubmissionByIdUseCase,
    private readonly getSubmissionsByUser: GetSubmissionsByUserUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const result = await this.createSubmission.execute({
        ...req.body,
        userId,
      });
      res.status(201).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      const statusCode =
        error instanceof Error &&
        /required|invalid|missing/i.test(error.message)
          ? 400
          : 500;

      res.status(statusCode).json({ message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const result = await this.getSubmissionById.execute(id);
      if (!result) {
        res.status(404).json({ message: 'Submission not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const result = await this.getSubmissionsByUser.execute(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
