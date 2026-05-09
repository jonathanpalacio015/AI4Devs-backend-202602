import { validateCandidateData } from '../../src/application/validator';

describe('validateCandidateData - phone validation', () => {
  const baseCandidate = {
    firstName: 'Ana',
    lastName: 'Lopez',
    email: 'ana.lopez@example.com',
    address: 'Calle Falsa 123',
    educations: [],
    workExperiences: [],
    cv: null,
  };

  it('accepts a valid local phone', () => {
    const candidate = { ...baseCandidate, phone: '656874937' };

    expect(() => validateCandidateData(candidate)).not.toThrow();
    expect(candidate.phone).toBe('656874937');
  });

  it('normalizes phone with +34 prefix and spaces', () => {
    const candidate = { ...baseCandidate, phone: '+34 656 874 937' };

    expect(() => validateCandidateData(candidate)).not.toThrow();
    expect(candidate.phone).toBe('656874937');
  });

  it('normalizes phone with 0034 prefix and separators', () => {
    const candidate = { ...baseCandidate, phone: '0034-656-874-937' };

    expect(() => validateCandidateData(candidate)).not.toThrow();
    expect(candidate.phone).toBe('656874937');
  });

  it('accepts international phones with 12 digits', () => {
    const candidate = { ...baseCandidate, phone: '543512322850' };

    expect(() => validateCandidateData(candidate)).not.toThrow();
    expect(candidate.phone).toBe('543512322850');
  });

  it('accepts international phones with plus and spaces', () => {
    const candidate = { ...baseCandidate, phone: '+54 351 232 2850' };

    expect(() => validateCandidateData(candidate)).not.toThrow();
    expect(candidate.phone).toBe('543512322850');
  });

  it('rejects invalid phone numbers', () => {
    const candidate = { ...baseCandidate, phone: '12345' };

    expect(() => validateCandidateData(candidate)).toThrow('Invalid phone');
  });
});
