import { describe, it, expect } from 'vitest';
import { AuthUserEmail } from '../../../src/auth/domain/auth-user-email';

describe('AuthUserEmail', () => {
  it('acepta un email válido y devuelve su valor', () => {
    const email = new AuthUserEmail('ana@mail.com');

    expect(email.getValue()).toBe('ana@mail.com');
  });

  it('rechaza un email vacío', () => {
    expect(() => new AuthUserEmail('')).toThrow('Email cannot be empty');
  });

  it('rechaza un email con solo espacios', () => {
    expect(() => new AuthUserEmail('   ')).toThrow('Email cannot be empty');
  });

  it('rechaza un email sin arroba', () => {
    expect(() => new AuthUserEmail('anamail.com')).toThrow(
      'Invalid email format'
    );
  });

  it('rechaza un email sin dominio', () => {
    expect(() => new AuthUserEmail('ana@')).toThrow('Invalid email format');
  });
});