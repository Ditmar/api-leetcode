import * as z from 'zod';

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
    JWT: z
      .object({
        secret: z.string().trim().min(1).optional(),
        expiresIn: z.coerce.number().min(1000),
        saltRounds: z.coerce.number().min(4).max(31),
        refreshTokenSecret: z.string().trim().min(1).optional(),
        refreshTokenExpiresIn: z.coerce.number().min(1000),
      })
      .optional(),
  })
  .superRefine((config, ctx) => {
    const isProduction = config.app.nodeEnv === 'production';
    const databaseUrl = config.database?.url ?? '';
    const jwtSecret = config.JWT?.secret ?? '';
    const refreshTokenSecret = config.JWT?.refreshTokenSecret ?? '';

    if (databaseUrl && containsKnownPlaceholder(databaseUrl)) {
      ctx.addIssue({
        code: 'custom',
        path: ['database', 'url'],
        message: 'DATABASE_URL contains a known insecure placeholder value.',
      });
    }

    if (jwtSecret && containsKnownPlaceholder(jwtSecret)) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'secret'],
        message: 'JWT_SECRET contains a known insecure placeholder value.',
      });
    }

    if (refreshTokenSecret && containsKnownPlaceholder(refreshTokenSecret)) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'refreshTokenSecret'],
        message:
          'JWT_REFRESH_TOKEN_SECRET contains a known insecure placeholder value.',
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

    if (!jwtSecret.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'secret'],
        message: 'JWT_SECRET is required in production.',
      });
    } else if (jwtSecret.trim().length < 32) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'secret'],
        message:
          'JWT_SECRET must be at least 32 characters long in production.',
      });
    }

    if (!refreshTokenSecret.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'refreshTokenSecret'],
        message: 'JWT_REFRESH_TOKEN_SECRET is required in production.',
      });
    } else if (refreshTokenSecret.trim().length < 32) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT', 'refreshTokenSecret'],
        message:
          'JWT_REFRESH_TOKEN_SECRET must be at least 32 characters long in production.',
      });
    }
  });
