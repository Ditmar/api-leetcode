import { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';

export class TestController {
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

  async startTest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
        });
        return;
      }

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'userId is required',
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

  async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionId } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
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

      const result = await services.tests.getQuestions.execute(id, sessionId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const status = errorMessage.includes('session') ? 400 : 500;
      res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  async submitTest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionId, answers } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Test ID is required',
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

      if (!answers || !Array.isArray(answers)) {
        res.status(400).json({
          success: false,
          error: 'answers array is required',
        });
        return;
      }

      const result = await services.tests.submit.execute(
        id,
        sessionId,
        answers
      );
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const status = errorMessage.includes('session') ? 400 : 500;
      res.status(status).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
