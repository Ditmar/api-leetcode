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
    expiresIn: z.union([z.string().regex(/^(\d+[smhd])$/), z.number().min(60)]),
    saltRounds: z.number().min(4).max(31),
  }),
});
