import { describe, expect, it } from 'vitest';
import type { AuthenticatedIdentity, Role } from '@patient-touch/types';
import { demoAssignments, demoPatient } from '@patient-touch/types/demo';
import { canAccessPatient, type Capability } from '../src/index';

const actor = (
  userId: string,
  roles: Role[],
  organizationId = 'org-demo',
): AuthenticatedIdentity => ({
  userId,
  authentication: 'local-synthetic-demo',
  memberships: [{ id: 'membership', userId, organizationId, roles, status: 'active' }],
});
function allowed(identity: AuthenticatedIdentity, capability: Capability, authorId?: string) {
  return canAccessPatient({
    identity,
    organizationId: 'org-demo',
    patient: demoPatient,
    assignments: demoAssignments,
    capability,
    ...(authorId ? { authorId } : {}),
  });
}
describe('patient-scoped authorization', () => {
  it('denies another tenant even for an owner', () => {
    expect(allowed(actor('owner', ['owner'], 'other-org'), 'patient_directory')).toBe(false);
  });
  it('does not give clinical access to practice operations or billing roles', () => {
    for (const role of ['owner', 'administrator', 'billing'] as const)
      expect(allowed(actor('staff', [role]), 'clinical')).toBe(false);
    expect(allowed(actor('staff', ['billing']), 'billing')).toBe(true);
  });
  it('requires an active clinician assignment', () => {
    expect(allowed(actor('user-demo-therapist', ['clinician']), 'clinical')).toBe(true);
    expect(allowed(actor('unassigned', ['clinician']), 'clinical')).toBe(false);
  });
  it('restricts psychotherapy notes to their assigned clinician author', () => {
    const clinician = actor('user-demo-therapist', ['clinician']);
    expect(allowed(clinician, 'psychotherapy', 'other-author')).toBe(false);
    expect(allowed(clinician, 'psychotherapy', clinician.userId)).toBe(true);
  });
  it('keeps patient journals private and scopes portal access to self', () => {
    expect(allowed(actor('user-demo-patient', ['patient']), 'journal')).toBe(true);
    expect(allowed(actor('user-demo-therapist', ['clinician']), 'journal')).toBe(false);
    expect(allowed(actor('user-demo-patient-2', ['patient']), 'portal')).toBe(false);
    expect(allowed(actor('user-demo-patient', ['patient']), 'clinical')).toBe(false);
  });
  it('permits multiple roles but ignores suspended memberships', () => {
    expect(allowed(actor('user-demo-therapist', ['owner', 'clinician']), 'clinical')).toBe(true);
    const suspended = actor('user-demo-therapist', ['clinician']);
    suspended.memberships[0]!.status = 'suspended';
    expect(allowed(suspended, 'clinical')).toBe(false);
  });
  it('selects the correct membership without carrying a role across practices', () => {
    const clinician = actor('user-demo-therapist', ['clinician']);
    clinician.memberships.unshift({
      id: 'other-membership',
      userId: clinician.userId,
      organizationId: 'other-org',
      roles: ['owner'],
      status: 'active',
    });
    expect(allowed(clinician, 'clinical')).toBe(true);
    expect(allowed(clinician, 'administration')).toBe(false);
  });
});
