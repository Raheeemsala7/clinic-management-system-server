import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),

  // ── Database ──────────────────────────────────────────────────────────────
  // DATABASE_URL: pooled connection (running app)
  // DIRECT_URL:   non-pooled (Prisma migrate / seed only)
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .messages({
      'string.base': 'DATABASE_URL must be a string.',
      'any.required':
        'DATABASE_URL is required. Set the Neon POOLED connection string (host contains -pooler).',
      'string.uri': 'DATABASE_URL must be a valid postgresql:// URI.',
    }),

  DIRECT_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .optional() // optional so the app can start without a DB (unit tests, type-check)
    .messages({
      'string.uri': 'DIRECT_URL must be a valid postgresql:// URI (non-pooled for migrations).',
    }),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_ACCESS_SECRET is required (min 32 chars; use 128-char hex in production).',
    'string.min': 'JWT_ACCESS_SECRET must be at least 32 characters.',
  }),
  JWT_ACCESS_TTL: Joi.number().default(900),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_REFRESH_SECRET is required (must be different from JWT_ACCESS_SECRET).',
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters.',
  }),
  JWT_REFRESH_TTL: Joi.number().default(604800),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // ── Clinic ────────────────────────────────────────────────────────────────
  CLINIC_TIMEZONE: Joi.string().default('Africa/Cairo'),
  CURRENCY_CODE: Joi.string().length(3).default('EGP'),

  // ── Storage ───────────────────────────────────────────────────────────────
  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  LOCAL_STORAGE_PATH: Joi.string().default('./uploads'),
  S3_ENDPOINT: Joi.when('STORAGE_DRIVER', {
    is: 's3',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  S3_REGION: Joi.string().default('us-east-1'),
  S3_BUCKET: Joi.string().default('clinic-attachments'),
  S3_ACCESS_KEY: Joi.when('STORAGE_DRIVER', {
    is: 's3',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  S3_SECRET_KEY: Joi.when('STORAGE_DRIVER', {
    is: 's3',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(false),

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
  AUTH_RATE_LIMIT_TTL: Joi.number().default(60),
  AUTH_RATE_LIMIT_MAX: Joi.number().default(5),
}).options({ allowUnknown: true });
