/* eslint-env jest */
/// <reference types="jest" />

import { GetQuestionsUseCase } from './GetQuestionsUseCase';
import type { TestRepository } from '../../domain/repositories/TestRepository';
import type { Question } from '../../domain/entities/Question';
import { splitProgrammingData } from '../../domain/entities/ProgrammingData';

const TEST_ID = '11111111-1111-4111-8111-111111111111';
const SESSION_ID = '22222222-2222-4222-8222-222222222222';
const USER_ID = 'user-1';

const SECRET_HIDDEN_INPUT = 'SECRET_HIDDEN_INPUT_9f3a';
const SECRET_HIDDEN_OUTPUT = 'SECRET_HIDDEN_OUTPUT_9f3a';
const SECRET_EXAMPLE_OUTPUT = 'SECRET_EXAMPLE_OUTPUT_9f3a';
const SECRET_GLOBAL_OUTPUT = 'SECRET_GLOBAL_OUTPUT_9f3a';
const SECRET_OPTION_FLAG = 'SECRET_OPTION_FLAG_9f3a';

const now = new Date();

const mcqQuestion: Question = {
  id: 'q-mcq',
  testId: TEST_ID,
  type: 'MCQ',
  text: '¿Cuánto es 2 + 2?',
  difficulty: 'EASY',
  points: 1,
  timeLimit: null,
  order: 1,
  options: [
    { id: 'A', text: '3', isCorrect: SECRET_OPTION_FLAG },
    { id: 'B', text: '4', isCorrect: SECRET_OPTION_FLAG },
  ] as unknown as Record<string, unknown>,
  correctAnswer: ['B'],
  createdAt: now,
  updatedAt: now,
};

const rawProgrammingData = {
  starterCode: 'function sum(a, b) {}',
  expectedOutput: SECRET_GLOBAL_OUTPUT,
  testCases: [
    {
      input: '1 2',
      expectedOutput: SECRET_EXAMPLE_OUTPUT,
      isExample: true,
      explanation: '1 + 2 = 3',
    },
    {
      input: SECRET_HIDDEN_INPUT,
      expectedOutput: SECRET_HIDDEN_OUTPUT,
      isExample: false,
    },
    {
      input: SECRET_HIDDEN_INPUT,
      expectedOutput: SECRET_HIDDEN_OUTPUT,
    },
  ],
};

const { publicData, privateData } = splitProgrammingData(rawProgrammingData);

const programmingQuestion: Question = {
  id: 'q-prog',
  testId: TEST_ID,
  type: 'PROGRAMMING',
  text: 'Suma dos números',
  difficulty: 'MEDIUM',
  points: 5,
  timeLimit: 60,
  order: 2,
  programmingPublic: publicData,
  programmingPrivate: privateData,
  createdAt: now,
  updatedAt: now,
};

const buildUseCase = () => {
  const repo = {
    getSessionById: async () => ({
      id: SESSION_ID,
      testId: TEST_ID,
      userId: USER_ID,
      startedAt: now,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      isActive: true,
    }),
    getQuestionsByTestId: async () => [mcqQuestion, programmingQuestion],
  } as unknown as TestRepository;

  return new GetQuestionsUseCase(repo);
};

describe('GetQuestionsUseCase - no filtra datos privados (API-016)', () => {
  it('la respuesta JSON no contiene correctAnswer, expectedOutput ni test cases ocultos', async () => {
    const result = await buildUseCase().execute(TEST_ID, SESSION_ID, USER_ID);
    const json = JSON.stringify(result);

    expect(json).not.toContain('correctAnswer');
    expect(json).not.toContain('expectedOutput');
    expect(json).not.toContain('isCorrect');
    expect(json).not.toContain('testCases');

    for (const secret of [
      SECRET_HIDDEN_INPUT,
      SECRET_HIDDEN_OUTPUT,
      SECRET_EXAMPLE_OUTPUT,
      SECRET_GLOBAL_OUTPUT,
      SECRET_OPTION_FLAG,
    ]) {
      expect(json).not.toContain(secret);
    }
  });

  it('sí devuelve la parte pública: starterCode, ejemplos (sin salida) y opciones', async () => {
    const result = await buildUseCase().execute(TEST_ID, SESSION_ID, USER_ID);

    const mcq = result.questions.find(q => q.id === 'q-mcq');
    const prog = result.questions.find(q => q.id === 'q-prog');

    expect(mcq?.options).toEqual([
      { id: 'A', text: '3' },
      { id: 'B', text: '4' },
    ]);
    expect(prog?.programmingData).toEqual({
      starterCode: 'function sum(a, b) {}',
      examples: [{ input: '1 2', explanation: '1 + 2 = 3' }],
    });
  });

  it('la parte privada conserva todo lo necesario para calificar (no se pierde)', () => {
    expect(privateData.testCases).toHaveLength(3);
    expect(privateData.testCases[0]?.expectedOutput).toBe(
      SECRET_EXAMPLE_OUTPUT
    );
    expect(privateData.expectedOutput).toBe(SECRET_GLOBAL_OUTPUT);
  });
});
