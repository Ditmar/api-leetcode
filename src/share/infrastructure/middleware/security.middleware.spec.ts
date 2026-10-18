/* eslint-env jest */
import express, { Application, RequestHandler } from 'express';
import { AddressInfo } from 'net';
import { Server } from 'http';
import {
  loginLimiter,
  refreshLimiter,
  signupLimiter,
} from './rate-limit.middleware';
import { createTimeoutMiddleware } from './timeout.middleware';

const listen = (app: Application): Promise<{ server: Server; url: string }> =>
  new Promise(resolve => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });

const ok: RequestHandler = (req, res) => {
  res.status(200).json({ ok: true });
};

const post = (url: string, headers: Record<string, string> = {}) =>
  fetch(url, { method: 'POST', headers }).then(res => res.status);

describe('API-010 rate limiting', () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const app = express();
    app.post('/login', loginLimiter, ok);
    app.post('/signup', signupLimiter, ok);
    ({ server, url } = await listen(app));
  });

  afterAll(() => server.close());

  it('returns 429 on the 11th login from the same IP within a minute', async () => {
    for (let i = 1; i <= 10; i++) {
      expect(await post(`${url}/login`)).toBe(200);
    }
    expect(await post(`${url}/login`)).toBe(429);
  });

  it('ignores a client-sent X-Forwarded-For when trust proxy is disabled', async () => {
    expect(
      await post(`${url}/login`, { 'X-Forwarded-For': '203.0.113.7' })
    ).toBe(429);
  });

  it('keeps a separate counter per auth route', async () => {
    expect(await post(`${url}/signup`)).toBe(200);
  });
});

describe('API-010 rate limiting behind a trusted proxy', () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const app = express();
    // Simulates a trusted proxy (Astro) forwarding the real client IP.
    app.set('trust proxy', 'loopback');
    app.post('/refresh', refreshLimiter, ok);
    ({ server, url } = await listen(app));
  });

  afterAll(() => server.close());

  it('counts each forwarded client IP separately', async () => {
    const clientA = { 'X-Forwarded-For': '198.51.100.1' };
    const clientB = { 'X-Forwarded-For': '198.51.100.2' };

    for (let i = 1; i <= 10; i++) {
      expect(await post(`${url}/refresh`, clientA)).toBe(200);
    }
    expect(await post(`${url}/refresh`, clientA)).toBe(429);
    expect(await post(`${url}/refresh`, clientB)).toBe(200);
  });
});

describe('API-010 request timeout', () => {
  const TIMEOUT_MS = 100;
  const logger = { warn: jest.fn() };
  let server: Server;
  let url: string;
  let lateResponse: Promise<unknown>;

  beforeAll(async () => {
    const app = express();
    app.use(createTimeoutMiddleware(TIMEOUT_MS, logger));
    app.get('/slow', (req, res) => {
      // Mimics the existing async controllers: they respond whenever they finish.
      lateResponse = new Promise(resolve =>
        setTimeout(resolve, TIMEOUT_MS * 3)
      ).then(() => {
        res.status(200).json({ late: true });
      });
    });
    app.get('/fast', ok);
    ({ server, url } = await listen(app));
  });

  afterAll(() => server.close());

  it('closes the connection, survives the late response and keeps serving requests', async () => {
    await expect(fetch(`${url}/slow`)).rejects.toThrow();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('GET /slow')
    );

    // The late response must not throw (an unhandled rejection would terminate the process).
    await expect(lateResponse).resolves.toBeUndefined();

    const res = await fetch(`${url}/fast`);
    expect(res.status).toBe(200);
  });

  it('does not interfere with responses sent in time', async () => {
    logger.warn.mockClear();
    const res = await fetch(`${url}/fast`);
    expect(res.status).toBe(200);
    await new Promise(resolve => setTimeout(resolve, TIMEOUT_MS * 2));
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
