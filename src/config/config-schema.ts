import * as z from 'zod';

export const pistonLanguageConfigSchema = z.object({
  language: z.string().min(1),
  version: z.string().min(1),
});

export type PistonLanguageConfig = z.infer<typeof pistonLanguageConfigSchema>;
export type PistonLanguageMap = Record<string, PistonLanguageConfig>;

export const DEFAULT_PISTON_LANGUAGE_MAP: PistonLanguageMap = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
};

const optionalTokenSchema = z.preprocess(
  val => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().optional()
);

const pistonLanguageMapSchema = z.preprocess(val => {
  if (typeof val === 'string') {
    if (val.trim() === '') {
      return undefined;
    }
    try {
      return JSON.parse(val) as unknown;
    } catch {
      return val;
    }
  }
  if (typeof val === 'object' && val !== null) {
    return JSON.parse(JSON.stringify(val)) as unknown;
  }
  return val;
}, z.record(z.string(), pistonLanguageConfigSchema).default(DEFAULT_PISTON_LANGUAGE_MAP));

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
  PISTON_URL: z.string().url().default('http://localhost:2000'),
  PISTON_TOKEN: optionalTokenSchema,
  PISTON_COMPILE_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  PISTON_RUN_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  PISTON_MEMORY_LIMIT_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(128 * 1024 * 1024),
  PISTON_MAX_OUTPUT_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(64 * 1024),
  PISTON_MAX_CODE_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(64 * 1024),
  PISTON_LANGUAGE_MAP: pistonLanguageMapSchema,
});

export type AppConfig = z.infer<typeof configSchema>;
