import type {
  AuthenticatedIdentity,
  Membership,
  Patient,
  PatientClinicianAssignment,
  Role,
} from '@patient-touch/types';

/** A production adapter must verify expiry, issuer/audience and revocation before returning an identity. */
export interface AuthenticationProvider {
  authenticate(request: { authorization?: string }): Promise<AuthenticatedIdentity | null>;
}
export type Capability =
  | 'patient_directory'
  | 'scheduling'
  | 'billing'
  | 'clinical'
  | 'portal'
  | 'messaging'
  | 'journal'
  | 'psychotherapy'
  | 'administration';
export class AuthorizationError extends Error {
  readonly statusCode = 403;
  constructor() {
    super('You do not have access to this resource.');
    this.name = 'AuthorizationError';
  }
}
export function activeMembership(
  identity: AuthenticatedIdentity,
  organizationId: string,
): Membership | undefined {
  return identity.memberships.find(
    (membership) =>
      membership.organizationId === organizationId &&
      membership.userId === identity.userId &&
      membership.status === 'active',
  );
}
export function hasRole(
  identity: AuthenticatedIdentity,
  organizationId: string,
  roles: readonly Role[],
): boolean {
  return (
    activeMembership(identity, organizationId)?.roles.some((role) => roles.includes(role)) ?? false
  );
}
export function requireMembership(
  identity: AuthenticatedIdentity,
  organizationId: string,
): Membership {
  const membership = activeMembership(identity, organizationId);
  if (!membership) throw new AuthorizationError();
  return membership;
}
export interface PatientAccessContext {
  identity: AuthenticatedIdentity;
  organizationId: string;
  patient: Patient;
  assignments: readonly PatientClinicianAssignment[];
  capability: Capability;
  authorId?: string;
}
export function canAccessPatient(context: PatientAccessContext): boolean {
  const { identity, organizationId, patient, assignments, capability, authorId } = context;
  const membership = activeMembership(identity, organizationId);
  if (!membership || patient.organizationId !== organizationId) return false;
  const roles = membership.roles;
  const self = roles.includes('patient') && patient.userId === identity.userId;
  const assignedClinician =
    roles.includes('clinician') &&
    assignments.some(
      (assignment) =>
        assignment.organizationId === organizationId &&
        assignment.patientId === patient.id &&
        assignment.clinicianId === identity.userId &&
        assignment.active,
    );
  const operations = roles.includes('owner') || roles.includes('administrator');
  switch (capability) {
    case 'patient_directory':
    case 'scheduling':
      return self || assignedClinician || operations;
    case 'billing':
      return self || operations || roles.includes('billing');
    case 'clinical':
      return assignedClinician;
    case 'psychotherapy':
      return assignedClinician && authorId === identity.userId;
    case 'portal':
    case 'messaging':
      return self || assignedClinician;
    case 'journal':
      return self;
    case 'administration':
      return operations;
    default:
      return false;
  }
}
export function requirePatientAccess(context: PatientAccessContext): void {
  if (!canAccessPatient(context)) throw new AuthorizationError();
}
/** UI convenience only. The API remains the authorization boundary. */
export const navigationByRole: Record<Role, readonly string[]> = {
  owner: ['today', 'calendar', 'patients', 'billing', 'team', 'settings'],
  administrator: ['today', 'calendar', 'patients', 'team', 'settings'],
  clinician: ['today', 'calendar', 'patients', 'sessions', 'notes', 'messages'],
  billing: ['billing', 'insurance', 'reports'],
  patient: ['home', 'appointments', 'journey', 'care-plan', 'messages', 'settings'],
};
