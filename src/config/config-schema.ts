import * as z from 'zod';

export const configSchema = z.object({
  app: z.object({
    port: z.number().min(1).max(65535),
    nodeEnv: z.string().nonempty(),
    logLevel: z.string().optional(),
  }),
  database: z.object({
    url: z.string().min(10),
  }),
  JWT: z.object({
    secret: z.string().min(10),
    expiresIn: z.number().min(1000),
    saltRounds: z.number().min(4).max(31),
    refreshTokenSecret: z.string().min(10),
    refreshTokenExpiresIn: z.number().min(1000),
  }),
});

export type Config = z.infer<typeof configSchema>;
