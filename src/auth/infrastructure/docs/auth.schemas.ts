export const authSchemas = {
  SignupRequest: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: {
        type: 'string',
        example: 'Juan Pérez',
      },
      email: {
        type: 'string',
        example: 'juan@gmail.com',
      },
      password: {
        type: 'string',
        example: '12345678',
      },
    },
  },

  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        example: 'juan@gmail.com',
      },
      password: {
        type: 'string',
        example: '12345678',
      },
    },
  },

  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  },

  LoginResponse: {
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      refreshToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  },

  UserResponse: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'clz123456789',
      },
      name: {
        type: 'string',
        example: 'Juan Pérez',
      },
      email: {
        type: 'string',
        example: 'juan@gmail.com',
      },
    },
  },
};
