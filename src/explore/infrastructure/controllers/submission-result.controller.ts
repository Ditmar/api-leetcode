import { Request, Response } from 'express';
import { ProcessSubmissionResultUseCase } from '../../application/use-cases/process-submission-result.use-case';
import { ExecutionResult } from '../../domain/entities/execution-result.entity';

export class SubmissionResultController {
  constructor(
    private readonly processResultUseCase: ProcessSubmissionResultUseCase
  ) {}

  async handleResult(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params;
      const resultData = req.body;

      const executionResult = new ExecutionResult(
        resultData.status,
        resultData.runtimeMs,
        resultData.memoryMb,
        resultData.score,
        resultData.compileError || null,
        resultData.testCaseResults || []
      );

      await this.processResultUseCase.execute(submissionId!, executionResult);

      res.status(200).json({ message: 'Result processed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
