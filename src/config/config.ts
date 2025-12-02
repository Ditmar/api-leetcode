import configIn from 'config';
import { configSchema } from './config-schema';

const safeParseConfig = (config: unknown) => {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    console.error('Invalid configuration:');
    result.error.issues.forEach(issue => {
      console.error(` - ${issue.path.join('.')} : ${issue.message}`);
    });
    throw new Error('Invalid configuration');
  }
  return result.data;
};

const appConfig = configIn.get('app') as Record<string, unknown> | undefined;
const databaseConfig = configIn.get('database') as
  | Record<string, unknown>
  | undefined;
const jwtConfig = configIn.get('JWT') as Record<string, unknown> | undefined;

const nodeEnvFromConfig =
  typeof appConfig?.nodeEnv === 'string' ? appConfig.nodeEnv : '';
const nodeEnv =
  nodeEnvFromConfig || process.env.ENV || process.env.NODE_ENV || 'development';

const configToValidate = {
  app: {
    port: typeof appConfig?.port === 'number' ? appConfig.port : 3000,
    nodeEnv: nodeEnv,
    logLevel:
      typeof appConfig?.logLevel === 'string' ? appConfig.logLevel : 'info',
  },
  database: {
    url: typeof databaseConfig?.url === 'string' ? databaseConfig.url : '',
  },
  JWT: {
    secret: typeof jwtConfig?.secret === 'string' ? jwtConfig.secret : '',
    expiresIn:
      typeof jwtConfig?.expiresIn === 'number' ? jwtConfig.expiresIn : 30000,
    saltRounds:
      typeof jwtConfig?.saltRounds === 'number' ? jwtConfig.saltRounds : 10,
  },
};

const config = safeParseConfig(configToValidate);

export { config };
