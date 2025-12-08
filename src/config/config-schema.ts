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
});

export type Config = z.infer<typeof configSchema>;
