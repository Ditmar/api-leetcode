import configIn from 'config';
import { configSchema } from './config-schema';

const safeParseConfig = (config: unknown) => {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    // improve error visibility in different environments
    for (const issue of result.error.issues) {
      console.error(` - ${issue.path.join('.')} : ${issue.message}`);
    }
    throw new Error('Invalid configuration');
  }
  return result.data;
};
const getConfig = () => {
  return safeParseConfig(configIn);
};
const config = getConfig();

export { config };
