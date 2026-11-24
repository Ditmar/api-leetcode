export const authSchemas = {
  SignupRequest: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: {
        type: 'string',
        example: 'Juan Perez',
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

  RefreshTokenResponse: {
    type: 'object',
    required: ['accessToken', 'refreshToken'],
    properties: {
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      refreshToken: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440000',
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
        example: 'Juan Perez',
      },
      email: {
        type: 'string',
        example: 'juan@gmail.com',
      },
    },
  },
};
