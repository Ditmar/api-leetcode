import { describe, it, expect } from 'vitest';
import { AuthUserPassword } from '../../../src/auth/domain/auth-user-password';

describe('AuthUserPassword', () => {
  it('acepta un password de 6 caracteres (el mínimo)', () => {
    const password = new AuthUserPassword('abc123');

    expect(password.getValue()).toBe('abc123');
  });

  it('acepta un password largo y devuelve su valor', () => {
    const password = new AuthUserPassword('una-clave-larga-123');

    expect(password.getValue()).toBe('una-clave-larga-123');
  });

  it('rechaza un password vacío', () => {
    expect(() => new AuthUserPassword('')).toThrow('Password cannot be empty');
  });

  it('rechaza un password con solo espacios', () => {
    expect(() => new AuthUserPassword('      ')).toThrow(
      'Password cannot be empty'
    );
  });

  it('rechaza un password de 5 caracteres (menos del mínimo)', () => {
    expect(() => new AuthUserPassword('12345')).toThrow(
      'Password must be at least 6 characters long'
    );
  });
});