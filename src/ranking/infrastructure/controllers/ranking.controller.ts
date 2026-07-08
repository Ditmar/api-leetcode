import type { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';

export class RankingController {
  private isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    );
  }

  private parseDate(value: unknown): Date | undefined {
    if (typeof value !== 'string' || !value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    return date;
  }

  async getRanking(req: Request, res: Response): Promise<void> {
    try {
      const { testId, courseId, startDate, endDate, sort, limit, offset } =
        req.query;

      if (typeof testId === 'string' && testId && !this.isValidUUID(testId)) {
        res
          .status(400)
          .json({ success: false, error: 'Invalid testId format' });
        return;
      }

      if (
        typeof courseId === 'string' &&
        courseId &&
        !this.isValidUUID(courseId)
      ) {
        res
          .status(400)
          .json({ success: false, error: 'Invalid courseId format' });
        return;
      }

      const parsedLimit = limit === undefined ? 10 : Number(limit);
      const parsedOffset = offset === undefined ? 0 : Number(offset);
      const parsedSort = typeof sort === 'string' ? sort : 'points';

      if (!['points', 'submissions', 'average'].includes(parsedSort)) {
        res.status(400).json({
          success: false,
          error: 'sort must be one of: points, submissions, average',
        });
        return;
      }

      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
        res
          .status(400)
          .json({ success: false, error: 'limit must be a positive integer' });
        return;
      }

      if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        res.status(400).json({
          success: false,
          error: 'offset must be a non-negative integer',
        });
        return;
      }

      const parsedStartDate = this.parseDate(startDate);
      const parsedEndDate = this.parseDate(endDate);

      if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
        res.status(400).json({
          success: false,
          error: 'startDate cannot be greater than endDate',
        });
        return;
      }

      const result = await services.ranking.get.execute(
        {
          testId: typeof testId === 'string' ? testId : undefined,
          courseId: typeof courseId === 'string' ? courseId : undefined,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
        {
          sort: parsedSort as 'points' | 'submissions' | 'average',
          limit: parsedLimit,
          offset: parsedOffset,
        }
      );

      res.status(200).json({ success: true, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ success: false, error: message });
    }
  }
}
