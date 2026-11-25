export const testSchemas = {
  TestResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      company: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          logo: { type: 'string', nullable: true },
        },
      },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      duration: { type: 'integer' },
      totalQuestions: { type: 'integer' },
      questionsByType: {
        type: 'object',
        properties: {
          mcq: { type: 'integer' },
          programming: { type: 'integer' },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  TestDetailResponse: {
    // más detallado, con preguntas, etc.
    allOf: [{ $ref: '#/components/schemas/TestResponse' }],
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['MCQ', 'PROGRAMMING'] },
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } }, // para MCQ
            // otros campos
          },
        },
      },
    },
  },
  StartTestResponse: {
    type: 'object',
    properties: {
      testId: { type: 'string' },
      startedAt: { type: 'string', format: 'date-time' },
      expiresAt: { type: 'string', format: 'date-time' },
    },
  },
  SubmitTestRequest: {
    type: 'object',
    required: ['answers'],
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string' },
            selectedOption: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
  },
  SubmitTestResponse: {
    type: 'object',
    properties: {
      score: { type: 'number' },
      passed: { type: 'boolean' },
      feedback: { type: 'string' },
    },
  },
};
