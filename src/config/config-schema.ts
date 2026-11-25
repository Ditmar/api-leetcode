import * as z from 'zod';

const testSigningSecrets = new Set([
  'test-jwt-secret-32-char-minimum-value',
  'test-refresh-token-secret-32-char-min',
]);

const knownPlaceholderPatterns = [
  'your_jwt_secret_key',
  'your_refresh_token_secret_key',
  'your_database_url',
  'replace_with_a_secure_random_secret',
  'change_this_to_a_secure_random_string',
  'example_secret',
  'placeholder',
];

const containsKnownPlaceholder = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return knownPlaceholderPatterns.some(placeholder =>
    normalized.includes(placeholder)
  );
};

export const configSchema = z
  .object({
    app: z.object({
      port: z.coerce.number().min(1).max(65535),
      nodeEnv: z.string().trim().min(1),
      logLevel: z.string().optional(),
    }),
    database: z
      .object({
        url: z.string().trim().min(1).optional(),
      })
      .optional(),
    JWT: z.object({
      secret: z
        .string({ error: 'JWT_SECRET is required.' })
        .trim()
        .min(1, 'JWT_SECRET is required.'),
      expiresIn: z.coerce.number().min(1000),
      saltRounds: z.coerce.number().min(4).max(31),
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
            if (trimmed === '' || trimmed.toLowerCase() === 'false')
              return false;
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
  })
  .superRefine((config, ctx) => {
    const isProduction = config.app.nodeEnv === 'production';
    const databaseUrl = config.database?.url ?? '';
    const jwtSecret = config.JWT?.secret ?? '';

    if (databaseUrl && containsKnownPlaceholder(databaseUrl)) {
      ctx.addIssue({
        code: 'custom',
        path: ['database', 'url'],
        message: 'DATABASE_URL contains a known insecure placeholder value.',
      });
    }

    if (
      containsKnownPlaceholder(jwtSecret) ||
      (isProduction && testSigningSecrets.has(jwtSecret))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'secret'],
        message: 'JWT_SECRET contains a known insecure placeholder value.',
      });
    }

    if (!isProduction) {
      return;
    }

    if (!databaseUrl.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['database', 'url'],
        message: 'DATABASE_URL is required in production.',
      });
    }

    if (jwtSecret.length < 32) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'secret'],
        message:
          'JWT_SECRET must be at least 32 characters long in production.',
      });
    }
  });
