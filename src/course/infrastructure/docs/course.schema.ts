export const courseSchemas = {
  CourseResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      numberOfLessons: { type: 'integer' },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  EnrollRequest: {
    type: 'object',
    properties: {},
  },
  EnrolledCoursesResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/CourseResponse' },
      },
      pagination: { $ref: '#/components/schemas/PaginationMeta' },
    },
  },
};
