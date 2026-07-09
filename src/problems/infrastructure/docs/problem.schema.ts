export const problemSchemas = {
  ProblemResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      tags: { type: 'array', items: { type: 'string' } },
      constraints: { type: 'array', items: { type: 'string' } },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateProblemRequest: {
    type: 'object',
    required: [
      'slug',
      'title',
      'description',
      'difficulty',
      'tags',
      'constraints',
      'testCases',
      'starterCodes',
    ],
    properties: {
      slug: { type: 'string', example: 'two-sum' },
      title: { type: 'string' },
      description: { type: 'string' },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      tags: { type: 'array', items: { type: 'string' } },
      constraints: { type: 'array', items: { type: 'string' } },
      testCases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            input: { type: 'string' },
            expectedOutput: { type: 'string' },
            explanation: { type: 'string' },
            isExample: { type: 'boolean' },
            order: { type: 'integer' },
          },
          required: ['input', 'expectedOutput', 'isExample', 'order'],
        },
      },
      starterCodes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            language: { type: 'string' },
            code: { type: 'string' },
          },
          required: ['language', 'code'],
        },
      },
    },
  },
  UpdateProblemRequest: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      tags: { type: 'array', items: { type: 'string' } },
      constraints: { type: 'array', items: { type: 'string' } },
      isActive: { type: 'boolean' },
    },
  },
};
