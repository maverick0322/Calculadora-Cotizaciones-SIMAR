import { describe, expect, it } from 'vitest';
import { buildEmissionInitials } from '@renderer/features/cotizacion/components/dashboard/EmitConfirmationModal';
import { User } from '../../../../../../shared/types/Auth';

const buildUser = (overrides: Partial<User>): User => ({
  id: 1,
  central_id: 'V-001',
  full_name: 'Valeria Morales Ruiz',
  employee_key: 'V-001',
  initials: '',
  email: 'valeria.morales@simar.com',
  role: 'sales',
  is_active: true,
  ...overrides
});

describe('buildEmissionInitials', () => {
  it('uses explicit initials when available', () => {
    expect(buildEmissionInitials(buildUser({ initials: 'VMR' }))).toBe('VMR');
  });

  it('uses a sanitized employee key when initials are missing', () => {
    expect(buildEmissionInitials(buildUser({ initials: '', employee_key: 'V-001' }))).toBe('V001');
  });

  it('falls back to full name initials and never returns a single character', () => {
    expect(buildEmissionInitials(buildUser({ initials: '', employee_key: '', full_name: 'Ana Lopez' }))).toBe('AL');
    expect(buildEmissionInitials(buildUser({ initials: '', employee_key: '', full_name: 'A' }))).toBe('SIMAR');
  });
});
