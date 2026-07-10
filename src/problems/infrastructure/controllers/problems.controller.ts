import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProblemDto } from '../../application/dtos/create-problem.dto';
import type { Request, Response } from 'express';
import type { GetProblemsUseCase } from '../../application/use-cases/get-problems.use-case';
import type { GetProblemByIdUseCase } from '../../application/use-cases/get-problem-by-id.use-case';
import type { GetProblemBySlugUseCase } from '../../application/use-cases/get-problem-by-slug.use-case';
import type { GetTagsUseCase } from '../../application/use-cases/get-tags.use-case';
import type { GetStatsUseCase } from '../../application/use-cases/get-stats.use-case';
import type { CreateProblemUseCase } from '../../application/use-cases/create-problem.use-case';
import type { UpdateProblemUseCase } from '../../application/use-cases/update-problem.use-case';
import type { ProblemRepository } from '../../domain/repositories/problem.repository';

export class ProblemsController {
  constructor(
    private readonly getProblems: GetProblemsUseCase,
    private readonly getProblemById: GetProblemByIdUseCase,
    private readonly getProblemBySlug: GetProblemBySlugUseCase,
    private readonly getTags: GetTagsUseCase,
    private readonly getStats: GetStatsUseCase,
    private readonly createProblem: CreateProblemUseCase,
    private readonly updateProblem: UpdateProblemUseCase,
    private readonly problemRepository: ProblemRepository
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, difficulty, tag, page, pageSize } = req.query;

      if (
        difficulty &&
        !['EASY', 'MEDIUM', 'HARD'].includes(difficulty as string)
      ) {
        res.status(400).json({
          message: `Invalid difficulty "${difficulty}". Must be EASY, MEDIUM or HARD`,
        });
        return;
      }

      const result = await this.getProblems.execute({
        search: search as string | undefined,
        difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
        tag: tag as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to list problems: ${error.message}` });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id ?? '';
      const result = await this.getProblemById.execute(id.toString());
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug ?? '';
      const result = await this.getProblemBySlug.execute(slug.toString());
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async tags(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getTags.execute();
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async stats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const result = await this.getStats.execute(userId);
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(CreateProblemDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const flattenErrors = (
          errs: typeof errors,
          parentPath = ''
        ): { field: string; constraints: Record<string, string> }[] => {
          return errs.flatMap(e => {
            const path = parentPath
              ? `${parentPath}.${e.property}`
              : e.property;
            const own = e.constraints
              ? [{ field: path, constraints: e.constraints }]
              : [];
            const nested = e.children?.length
              ? flattenErrors(e.children, path)
              : [];
            return [...own, ...nested];
          });
        };

        res.status(400).json({
          message: 'Validation failed',
          errors: flattenErrors(errors),
        });
        return;
      }

      const result = await this.createProblem.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id ?? '';
      const result = await this.updateProblem.execute(id.toString(), req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id ?? '';
      const existing = await this.getProblemById.execute(id.toString());
      if (!existing) {
        res.status(404).json({ message: `Problem with id ${id} not found` });
        return;
      }
      await this.problemRepository.softDelete(id.toString());
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
