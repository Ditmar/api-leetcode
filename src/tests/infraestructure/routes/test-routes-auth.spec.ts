/* eslint-env jest */
/// <reference types="jest" />

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Server } from 'http';
import { testRoutes } from './test-routes';

jest.mock(
  '@config',
  () => ({
    config: {
      JWT: {
        secret: 'test-secret-key-with-at-least-32-characters',
      },
    },
  }),
  { virtual: true }
);

jest.mock(
  '@logger',
  () => ({
    __esModule: true,
    default: {
      warn: jest.fn(),
      error: jest.fn(),
    },
  }),
  { virtual: true }
);

jest.mock('../controller/TestController', () => ({
  TestController: class {
    startTest(req: Request, res: Response): void {
      res.status(201).json({ userId: req.userId });
    }

    getQuestions(req: Request, res: Response): void {
      res.status(200).json({ userId: req.userId });
    }

    submitTest(req: Request, res: Response): void {
      res.status(201).json({ userId: req.userId });
    }
  },
}));

describe('Test routes JWT authentication - API-001', () => {
  let server: Server;
  let baseUrl: string;

  const testId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/tests', testRoutes);

    server = app.listen(0, '127.0.0.1');

    await new Promise<void>(resolve => {
      server.once('listening', resolve);
    });

    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Could not start test server');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close(error => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });

  const protectedRoutes = [
    { method: 'POST', path: 'start' },
    { method: 'GET', path: 'questions' },
    { method: 'POST', path: 'submit' },
  ];

  it.each(protectedRoutes)(
    'should return 401 for $method $path with only x-user-id',
    async ({ method, path }) => {
      const response = await fetch(`${baseUrl}/api/tests/${testId}/${path}`, {
        method,
        headers: {
          'x-user-id': 'fake-user-id',
          'Content-Type': 'application/json',
        },
        ...(method === 'POST' ? { body: JSON.stringify({}) } : {}),
      });

      expect(response.status).toBe(401);
    }
  );

  it.each(protectedRoutes)(
    'should accept a valid JWT for $method $path',
    async ({ method, path }) => {
      const token = jwt.sign(
        {
          id: 'valid-user-id',
          email: 'test@example.com',
        },
        'test-secret-key-with-at-least-32-characters',
        { algorithm: 'HS256' }
      );

      const response = await fetch(`${baseUrl}/api/tests/${testId}/${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(method === 'POST' ? { body: JSON.stringify({}) } : {}),
      });

      const body = (await response.json()) as { userId: string };

      expect([200, 201]).toContain(response.status);
      expect(body.userId).toBe('valid-user-id');
    }
  );
});
