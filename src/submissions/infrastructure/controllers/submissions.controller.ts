import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Request, Response } from 'express';
import { CreateSubmissionDto } from '../../application/dtos/create-submission.dto';
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
      const dto = plainToInstance(CreateSubmissionDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const message = errors
          .map(error => Object.values(error.constraints ?? {}).join(', '))
          .join('; ');
        res
          .status(400)
          .json({ message: message || 'Invalid submission payload' });
        return;
      }

      const userId = (req as Request & { userId?: string }).userId;
      const result = await this.createSubmission.execute({
        ...dto,
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
      const userId = (req as Request & { userId?: string }).userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const result = await this.getSubmissionById.execute(id);
      if (!result) {
        res.status(404).json({ message: 'Submission not found' });
        return;
      }

      if (result.getUserId() !== userId) {
        res.status(403).json({ message: 'Forbidden' });
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
      const userId = (req as Request & { userId?: string }).userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const id = typeof req.params.id === 'string' ? req.params.id : '';
      if (id !== userId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const page = this.parsePositiveInteger(req.query.page, 1);
      const limit = this.parsePositiveInteger(req.query.limit, 20);
      if (page === null || limit === null) {
        res
          .status(400)
          .json({ message: 'page and limit must be positive integers' });
        return;
      }

      const result = await this.getSubmissionsByUser.execute(id, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  private parsePositiveInteger(
    value: unknown,
    fallback: number
  ): number | null {
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
      }
      return parsed;
    }

    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }

    return fallback;
  }
}
