export const contestSchemas = {
  ContestProblemResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      problemId: { type: 'string' },
      order: { type: 'integer' },
      points: { type: 'integer' },
      problem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
        },
      },
    },
  },
  ContestResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      difficulty: { type: 'string' },
      status: { type: 'string', enum: ['UPCOMING', 'ACTIVE', 'FINISHED'] },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      durationMins: { type: 'integer' },
      prize: { type: 'string', nullable: true },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      problems: {
        type: 'array',
        items: { $ref: '#/components/schemas/ContestProblemResponse' },
      },
    },
  },
  CreateContestRequest: {
    type: 'object',
    required: [
      'title',
      'description',
      'difficulty',
      'startTime',
      'endTime',
      'problems',
    ],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      prize: { type: 'string', nullable: true },
      problems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            problemId: { type: 'string' },
            order: { type: 'integer' },
            points: { type: 'integer' },
          },
          required: ['problemId', 'order', 'points'],
        },
      },
    },
  },
  RegisterResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Registered successfully' },
    },
  },
  ContestStatsResponse: {
    type: 'object',
    properties: {
      totalContests: { type: 'integer' },
      activeContests: { type: 'integer' },
      // otros campos según necesidad
    },
  },
};
