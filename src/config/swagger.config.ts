import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Application } from 'express';

import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

export function configureSwagger(app: Application) {
  const openapiPath = resolve(process.cwd(), 'openapi.yaml');
  const swaggerSpec = parse(readFileSync(openapiPath, 'utf8'));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
