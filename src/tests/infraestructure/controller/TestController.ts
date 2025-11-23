import { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';
import { AuthRequest } from '../../../share/infrastructure/middleware/auth.middleware';

export class TestController {
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async getTests(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        companyId,
        difficulty,
        orderBy,
      } = req.query;

      if (companyId && !this.isValidUUID(companyId as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid companyId format',
        });
        return;
      }

      if (
        difficulty &&
        !['EASY', 'MEDIUM', 'HARD'].includes(difficulty as string)
      ) {
        res.status(400).json({
          success: false,
          error: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD',
        });
        return;
      }

      const result = await services.tests.getAll.execute({
        page: Number(page),
        limit: Number(limit),
        search: search as string | undefined,
        companyId: companyId as string | undefined,
        difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' | undefined,
        orderBy: orderBy as string | undefined,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async getTestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
        });
        return;
      }

      if (!this.isValidUUID(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid test ID format',
        });
        return;
      }

      const result = await services.tests.getById.execute(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const status = errorMessage === 'Test not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async startTest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
        });
        return;
      }

      if (!this.isValidUUID(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid test ID format',
        });
        return;
      }

      const result = await services.tests.start.execute(id, userId);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const status = errorMessage.includes('not found')
        ? 404
        : errorMessage.includes('not active')
          ? 400
          : 500;
      res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async getQuestions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;
      const userId = req.user!.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
        });
        return;
      }

      if (!this.isValidUUID(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid test ID format',
        });
        return;
      }

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'sessionId is required',
        });
        return;
      }

      if (!this.isValidUUID(sessionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid sessionId format',
        });
        return;
      }

      const result = await services.tests.getQuestions.execute(
        id,
        sessionId,
        userId
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const status =
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('expired')
          ? 403
          : errorMessage.includes('session')
            ? 400
            : 500;
      res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async submitTest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionId, answers } = req.body;
      const userId = req.user!.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
        });
        return;
      }

      if (!this.isValidUUID(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid test ID format',
        });
        return;
      }

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'sessionId is required',
        });
        return;
      }

      if (!this.isValidUUID(sessionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid sessionId format',
        });
        return;
      }

      if (!answers || !Array.isArray(answers)) {
        res.status(400).json({
          success: false,
          error: 'answers array is required',
        });
        return;
      }

      if (answers.length === 0) {
        res.status(400).json({
          success: false,
          error: 'At least one answer is required',
        });
        return;
      }

      if (answers.length > 100) {
        res.status(400).json({
          success: false,
          error: 'Maximum 100 answers allowed (DoS protection)',
        });
        return;
      }

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];

        if (!answer.questionId) {
          res.status(400).json({
            success: false,
            error: `Answer at index ${i}: questionId is required`,
          });
          return;
        }

        if (!this.isValidUUID(answer.questionId)) {
          res.status(400).json({
            success: false,
            error: `Answer at index ${i}: invalid questionId format`,
          });
          return;
        }

        if (answer.selectedOption && answer.selectedOption.length > 500) {
          res.status(400).json({
            success: false,
            error: `Answer at index ${i}: selectedOption too long (max 500 chars)`,
          });
          return;
        }

        if (answer.code && answer.code.length > 50000) {
          res.status(400).json({
            success: false,
            error: `Answer at index ${i}: code too long (max 50KB)`,
          });
          return;
        }

        if (answer.language && answer.language.length > 50) {
          res.status(400).json({
            success: false,
            error: `Answer at index ${i}: language name too long (max 50 chars)`,
          });
          return;
        }
      }

      const result = await services.tests.submit.execute(
        id,
        sessionId,
        answers,
        userId
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      let status = 500;
      if (errorMessage.includes('Submission already exists')) {
        status = 409;
      } else if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('expired')
      ) {
        status = 403;
      } else if (errorMessage.includes('session')) {
        status = 400;
      }

      res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
