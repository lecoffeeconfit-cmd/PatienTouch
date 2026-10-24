/** Domain contracts only. An ID or client role is never proof of authorization. */
export type Role = 'owner' | 'administrator' | 'clinician' | 'billing' | 'patient';
export const roleLabels: Record<Role, string> = {
  owner: 'Practice Owner',
  administrator: 'Practice Administrator',
  clinician: 'Therapist / Clinician',
  billing: 'Billing Staff',
  patient: 'Patient',
};

export interface User {
  id: string;
  displayName: string;
  email: string;
  initials: string;
  synthetic: true;
}
export interface Organization {
  id: string;
  name: string;
  timezone: string;
  synthetic: true;
}
export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  roles: Role[];
  status: 'active' | 'invited' | 'suspended';
}
export interface AuthenticatedIdentity {
  userId: string;
  memberships: Membership[];
  authentication: 'local-synthetic-demo' | 'verified-provider';
}
export interface TenantEntity {
  id: string;
  organizationId: string;
}
export interface Patient extends TenantEntity {
  userId: string;
  displayName: string;
  initials: string;
  email: string;
  status: 'active' | 'paused' | 'discharged';
  synthetic: true;
}
export interface PatientClinicianAssignment extends TenantEntity {
  patientId: string;
  clinicianId: string;
  active: boolean;
}
export interface Appointment extends TenantEntity {
  patientId: string;
  clinicianId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  modality: 'telehealth' | 'in_person';
}
export interface RecordingMetadata {
  enabled: false;
  consentStatus: 'not_requested' | 'declined' | 'withdrawn';
  retentionDays: number | null;
  // Playback URLs and raw recordings are intentionally absent from Phase 1.
}
export interface Session extends TenantEntity {
  patientId: string;
  clinicianId: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  themes: string[];
  portalShared: boolean;
  recording: RecordingMetadata;
}
export interface ClinicalProgressNote extends TenantEntity {
  patientId: string;
  sessionId: string;
  authorId: string;
  kind: 'clinical_progress';
  content: string;
  status: 'draft' | 'signed' | 'amended';
  createdAt: string;
}
/** Separately maintained, stricter author-only storage and access path. */
export interface PsychotherapyNote extends TenantEntity {
  patientId: string;
  sessionId: string;
  authorId: string;
  kind: 'psychotherapy';
  content: string;
  createdAt: string;
}
export interface PatientUpdate extends TenantEntity {
  patientId: string;
  sessionId: string;
  authorId: string;
  title: string;
  content: string;
  approvedAt: string | null;
}
/** Patient-private reflections are not a clinical note or a clinician inbox. */
export interface JournalEntry extends TenantEntity {
  patientId: string;
  authorUserId: string;
  title: string;
  content: string;
  createdAt: string;
  visibility: 'patient_private';
}
export interface TreatmentPlan extends TenantEntity {
  patientId: string;
  clinicianId: string;
  title: string;
  status: 'draft' | 'active' | 'completed';
  portalShared: boolean;
}
export interface Goal extends TenantEntity {
  patientId: string;
  treatmentPlanId: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed';
  portalShared: boolean;
}
export interface Consent extends TenantEntity {
  patientId: string;
  purpose: 'treatment' | 'telehealth' | 'recording' | 'portal_sharing';
  status: 'pending' | 'granted' | 'declined' | 'withdrawn';
  policyVersion: string;
  recordedAt: string | null;
}
export interface ResourceAssignment extends TenantEntity {
  patientId: string;
  assignedBy: string;
  title: string;
  description: string;
  category: 'exercise' | 'article' | 'worksheet';
  status: 'assigned' | 'completed';
  durationMinutes: number;
}
export interface Message extends TenantEntity {
  patientId: string;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: string;
  read: boolean;
}
export interface Notification extends TenantEntity {
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}
export interface JourneyEvent extends TenantEntity {
  patientId: string;
  type: 'session' | 'update' | 'goal' | 'resource';
  title: string;
  description: string;
  occurredAt: string;
  themes: string[];
  portalShared: boolean;
}
export interface TranscriptSegment {
  id: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}
export interface Bookmark extends TenantEntity {
  patientId: string;
  sessionId: string;
  userId: string;
  seconds: number;
  label: string;
}
export interface Invoice extends TenantEntity {
  patientId: string;
  description: string;
  amountCents: number;
  currency: 'USD';
  status: 'draft' | 'open' | 'paid' | 'void';
  issuedAt: string;
}
export interface InsuranceClaim extends TenantEntity {
  patientId: string;
  invoiceId: string;
  status: 'draft' | 'pending' | 'submitted' | 'rejected';
  reference: string;
}
export interface IntakeForm extends TenantEntity {
  patientId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'submitted';
  dueAt: string | null;
}
export interface RecordsAccessRequest extends TenantEntity {
  patientId: string;
  requestedBy: string;
  scope: 'clinical_record' | 'session_materials' | 'other';
  status: 'submitted' | 'under_review' | 'fulfilled' | 'declined';
  createdAt: string;
}
export type AuditAction =
  'read' | 'create' | 'update' | 'delete' | 'export' | 'share' | 'consent_change' | 'access_denied';
export interface AuditEvent extends TenantEntity {
  actorId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  outcome: 'allowed' | 'denied';
  occurredAt: string;
  requestId: string;
  // Never include note/message/journal bodies or authentication tokens.
}
export interface AuditLogger {
  write(event: AuditEvent): Promise<void>;
}
export type AiTask =
  'documentation_suggestion' | 'session_summary' | 'topic_extraction' | 'timeline_organization';
export interface AiSuggestion {
  id: string;
  task: AiTask;
  text: string;
  status: 'requires_clinician_review';
}
export interface ClinicalAiService {
  readonly enabled: boolean;
  propose(input: {
    organizationId: string;
    patientId: string;
    task: AiTask;
  }): Promise<AiSuggestion>;
}
export interface ApiErrorBody {
  error: { code: string; message: string; requestId?: string };
}
export interface DemoSession {
  mode: 'local-synthetic-demo';
  user: User;
  memberships: Membership[];
  organization: Organization;
  recordingEnabled: false;
  aiEnabled: false;
}
