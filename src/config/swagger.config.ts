import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { authSchemas } from '../auth/infrastructure/docs/auth.schemas';
import { problemSchemas } from '../problems/infrastructure/docs/problem.schema';
import { contestSchemas } from '../contests/infrastructure/docs/contests.schema';
import { courseSchemas } from '../course/infrastructure/docs/course.schema';
import { testSchemas } from '../tests/infraestructure/docs/tests.schema';
import { userSchemas } from '../user/infrastructure/docs/user.schema';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OpenAPI API',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ...authSchemas,
        ...problemSchemas,
        ...contestSchemas,
        ...courseSchemas,
        ...testSchemas,
        ...userSchemas,
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    process.env.NODE_ENV === 'production' ? './dist/**/*.js' : './src/**/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function configureSwagger(app: Application) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
