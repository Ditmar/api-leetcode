import { z } from 'zod';

export const RegisterDTO = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
