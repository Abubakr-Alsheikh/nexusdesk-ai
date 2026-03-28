import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.string().default('3000').transform(Number),

    // Database - either individual params or DATABASE_URL
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_PORT: z.string().default('5432'),
    DATABASE_URL: z
      .string()
      .url({ message: 'DATABASE_URL must be a valid PostgreSQL URL' })
      .optional(),

    // AI
    AI_API_KEY: z
      .string()
      .min(1, { message: 'AI_API_KEY is required for the LLM Service' }),
    AI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
    AI_MODEL: z.string().default('gpt-5-nano'),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.union([z.string(), z.number()]).default('1d'),
  })
  .refine(
    (data) =>
      data.DATABASE_URL || (data.DB_USER && data.DB_PASSWORD && data.DB_NAME),
    { message: 'Either DATABASE_URL or individual DB params required' },
  );

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 2),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
