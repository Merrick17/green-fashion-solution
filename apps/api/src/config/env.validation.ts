import { z } from 'zod';

// Treat empty strings as undefined so optional env vars left blank in .env
// (e.g. `AZURE_USER_EMAIL=`) don't fail format validators like `.email()` or `.url()`.
const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  REDIS_URL: optionalUrl,
  CORS_ORIGINS: optionalString.default('http://localhost:3001'),
  CORS_ORIGIN: optionalString, // singular alias used by the WS gateway (notifications.gateway.ts)
  WEB_URL: optionalUrl.default('http://localhost:3001'),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalEmail,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  AZURE_TENANT_ID: optionalString,
  AZURE_CLIENT_ID: optionalString,
  AZURE_CLIENT_SECRET: optionalString,
  AZURE_USER_EMAIL: optionalEmail,
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  PORT: z.coerce.number().optional().default(3000),
  // Read directly via process.env in ai-rag.service.ts; validated here so a bad value fails fast.
  EMBEDDING_DIMENSION: z.coerce.number().int().positive().optional(),
  // Structured JSON logging toggle (Phase 6 instrumentation). Read directly via process.env
  // in StructuredLoggerService. 'true' enables additive JSON request lifecycle logs alongside
  // the existing human-readable RequestLogMiddleware line; default off = no behavior change.
  LOG_STRUCTURED: z.enum(['true', 'false']).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  const cloudinaryVars = [
    result.data.CLOUDINARY_CLOUD_NAME,
    result.data.CLOUDINARY_API_KEY,
    result.data.CLOUDINARY_API_SECRET,
  ];
  const cloudinarySet = cloudinaryVars.filter(Boolean).length;
  if (cloudinarySet > 0 && cloudinarySet < 3) {
    throw new Error(
      'Invalid environment configuration:\n  Cloudinary: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET together',
    );
  }

  return result.data;
}
