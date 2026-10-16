/* eslint-env jest */
/// <reference types="jest" />

import { toProblemDetailDto } from './problem-response.dto';
import {
  Problem,
  StarterCode,
  TestCase,
} from '../../domain/entities/problem.entity';

const SECRET_EXAMPLE_OUTPUT = 'SECRET_EXAMPLE_OUTPUT_9f3a';
const SECRET_HIDDEN_INPUT = 'SECRET_HIDDEN_INPUT_9f3a';
const SECRET_HIDDEN_OUTPUT = 'SECRET_HIDDEN_OUTPUT_9f3a';

const buildProblem = (): Problem =>
  new Problem(
    'p-1',
    'two-sum',
    'Two Sum',
    'Descripción',
    'EASY',
    ['Array'],
    ['1 <= n <= 10'],
    true,
    0,
    0,
    [
      new TestCase(
        'tc-1',
        'p-1',
        '1 2',
        SECRET_EXAMPLE_OUTPUT,
        'ejemplo',
        true,
        1
      ),
      new TestCase(
        'tc-2',
        'p-1',
        SECRET_HIDDEN_INPUT,
        SECRET_HIDDEN_OUTPUT,
        null,
        false,
        2
      ),
    ],
    [new StarterCode('sc-1', 'p-1', 'typescript', 'function f() {}')]
  );

describe('toProblemDetailDto - no filtra datos privados (API-016)', () => {
  it('la respuesta JSON no contiene expectedOutput ni test cases ocultos', () => {
    const json = JSON.stringify(toProblemDetailDto(buildProblem()));

    expect(json).not.toContain('expectedOutput');
    expect(json).not.toContain(SECRET_EXAMPLE_OUTPUT);
    expect(json).not.toContain(SECRET_HIDDEN_INPUT);
    expect(json).not.toContain(SECRET_HIDDEN_OUTPUT);
  });

  it('sí devuelve el ejemplo (solo input y explicación) y el código inicial', () => {
    const dto = toProblemDetailDto(buildProblem());

    expect(dto.testCases).toEqual([
      { id: 'tc-1', input: '1 2', explanation: 'ejemplo', order: 1 },
    ]);
    expect(dto.starterCodes).toHaveLength(1);
  });
});
