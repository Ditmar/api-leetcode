import 'dotenv/config'; 
import logger from '@logger';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string | number;
  bcryptSaltRounds: number;
  databaseUrl: string;
}

/**
 * Validates and loads application configuration from environment variables.
 * Fails fast if critical configuration is missing.
 */
export function loadConfig(): AppConfig {
  const errors: string[] = [];

  // JWT Secret (critical)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    errors.push(
      'JWT_SECRET is required and must be at least 32 characters long'
    );
  }

  // Database URL (critical)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required');
  }

  // Port (with default)
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  // Node environment
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  // JWT expiration
  const rawExpires = process.env.JWT_EXPIRES_IN ?? '7d';
  const numeric = Number(rawExpires);
  const jwtExpiresIn: number | string = Number.isFinite(numeric)
    ? numeric
    : rawExpires;

  // Bcrypt salt rounds
  const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  if (
    !Number.isInteger(bcryptSaltRounds) ||
    bcryptSaltRounds < 4 ||
    bcryptSaltRounds > 31
  ) {
    errors.push('BCRYPT_SALT_ROUNDS must be an integer between 4 and 31');
  }

  // Fail fast if there are errors
  if (errors.length > 0) {
    logger.error('Configuration validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    process.exit(1);
  }

  const config: AppConfig = {
    port,
    nodeEnv,
    jwtSecret: jwtSecret!,
    jwtExpiresIn,
    bcryptSaltRounds,
    databaseUrl: databaseUrl!,
  };

  logger.info('Configuration loaded successfully');
  return config;
}

export const config = loadConfig();