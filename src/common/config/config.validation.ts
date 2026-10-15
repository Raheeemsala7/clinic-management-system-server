import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.number().default(900),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_TTL: Joi.number().default(604800),

  CORS_ORIGINS: Joi.string().default('http://localhost:3001'),

  CLINIC_TIMEZONE: Joi.string().default('Africa/Cairo'),
  CURRENCY_CODE: Joi.string().length(3).default('EGP'),

  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  LOCAL_STORAGE_PATH: Joi.string().default('./uploads'),

  // S3 optional unless STORAGE_DRIVER=s3
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

  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
  AUTH_RATE_LIMIT_TTL: Joi.number().default(60),
  AUTH_RATE_LIMIT_MAX: Joi.number().default(5),
}).options({ allowUnknown: true });
