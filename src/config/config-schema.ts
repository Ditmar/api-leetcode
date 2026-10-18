import * as z from 'zod';

export const configSchema = z.object({
  app: z.object({
    port: z.coerce.number().min(1).max(65535),
    nodeEnv: z.string().nonempty(),
    logLevel: z.string().optional(),
  }),
  database: z.object({
    url: z.string().min(10),
  }),
  JWT: z.object({
    secret: z.string().min(10),
    expiresIn: z.coerce.number().min(1000),
    saltRounds: z.coerce.number().min(4).max(31),
    refreshTokenSecret: z.string().min(10),
    refreshTokenExpiresIn: z.coerce.number().min(1000),
  }),
  // API-010: every key has a default, so the section is optional in config files.
  security: z
    .object({
      // Comma-separated list. Empty = no cross-origin requests allowed.
      corsOrigin: z
        .string()
        .default('')
        .transform(value =>
          value
            .split(',')
            .map(origin => origin.trim())
            .filter(Boolean)
        ),
      // false (default), hop count ("1") or comma-separated IPs/subnets.
      // "true" is rejected: it would trust X-Forwarded-For from any client.
      trustProxy: z
        .string()
        .default('false')
        .refine(value => value.trim().toLowerCase() !== 'true', {
          message:
            'TRUST_PROXY=true is insecure; use a hop count or trusted proxy IPs/subnets',
        })
        .transform((value): boolean | number | string[] => {
          const trimmed = value.trim();
          if (trimmed === '' || trimmed.toLowerCase() === 'false') return false;
          if (/^\d+$/.test(trimmed)) return Number(trimmed);
          return trimmed
            .split(',')
            .map(entry => entry.trim())
            .filter(Boolean);
        }),
      rateLimitWindowMs: z.coerce.number().int().positive().default(60000),
      rateLimitMax: z.coerce.number().int().positive().default(100),
      authRateLimitMax: z.coerce.number().int().positive().default(10),
      requestTimeoutMs: z.coerce.number().int().positive().default(30000),
    })
    .prefault({}),
});
