export const userSchemas = {
  UserResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clz123456789' },
      name: { type: 'string', example: 'Juan Pérez' },
      email: { type: 'string', example: 'juan@example.com' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateUserRequest: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Nuevo Usuario' },
      email: { type: 'string', example: 'nuevo@example.com' },
      password: { type: 'string', example: 'secure123' },
    },
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
  },
};
