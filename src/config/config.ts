import configIn from 'config';
import { configSchema } from './config-schema';

const safeParseConfig = (config: unknown) => {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    console.error(
      'Configuration validation failed. Application startup aborted.'
    );
    console.error(details);
    process.exit(1);
  }

  return result.data;
};

const getConfig = () => {
  return safeParseConfig(configIn);
};

const config = getConfig();

export { config };
