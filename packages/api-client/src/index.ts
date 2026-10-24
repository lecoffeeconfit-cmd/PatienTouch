import type {
  ApiErrorBody,
  Appointment,
  ClinicalProgressNote,
  DemoSession,
  Goal,
  JournalEntry,
  JourneyEvent,
  Message,
  Patient,
  PatientUpdate,
  PsychotherapyNote,
  RecordsAccessRequest,
  ResourceAssignment,
  Session,
} from '@patient-touch/types';
import {
  journalEntrySchema,
  messageSchema,
  recordsAccessRequestSchema,
  type JournalEntryInput,
  type MessageInput,
  type RecordsAccessRequestInput,
} from '@patient-touch/schemas';
import {
  demoAppointments,
  demoGoals,
  demoJourney,
  demoMessages,
  demoPatientUpdates,
  demoPatients,
  demoResources,
  demoSessions,
} from '@patient-touch/types/demo';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export interface PatientScope {
  organizationId: string;
  patientId: string;
}
export interface ApiClientOptions {
  baseUrl: string;
  /** Local demo identity selection only. It is never production authentication. */
  demoUserId?: string;
  getAccessToken?: () => Promise<string | null>;
  fetch?: typeof globalThis.fetch;
}
export function createApiClient(options: ApiClientOptions) {
  const base = new URL(options.baseUrl);
  if (options.demoUserId && !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))
    throw new Error('Synthetic demo identities may be sent only to localhost.');
  const fetcher = options.fetch ?? globalThis.fetch;
  async function request<T>(path: string, body?: unknown): Promise<T> {
    const token = await options.getAccessToken?.();
    const response = await fetcher(new URL(path, base), {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(options.demoUserId ? { 'X-Demo-User': options.demoUserId } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
    });
    const payload = (await response.json()) as { data?: T } & Partial<ApiErrorBody>;
    if (!response.ok)
      throw new ApiError(
        response.status,
        payload.error?.code ?? 'REQUEST_FAILED',
        payload.error?.message ?? 'The request could not be completed.',
      );
    if (!('data' in payload))
      throw new ApiError(502, 'INVALID_RESPONSE', 'The server returned an unexpected response.');
    return payload.data as T;
  }
  const patientPath = (scope: PatientScope, collection?: string) =>
    `/v1/organizations/${encodeURIComponent(scope.organizationId)}/patients/${encodeURIComponent(scope.patientId)}${collection ? `/${collection}` : ''}`;
  return {
    session: () => request<DemoSession>('/v1/demo/session'),
    patients: (organizationId: string) =>
      request<Patient[]>(`/v1/organizations/${encodeURIComponent(organizationId)}/patients`),
    patient: (scope: PatientScope) => request<Patient>(patientPath(scope)),
    appointments: (scope: PatientScope) =>
      request<Appointment[]>(patientPath(scope, 'appointments')),
    sessions: (scope: PatientScope) => request<Session[]>(patientPath(scope, 'sessions')),
    journey: (scope: PatientScope) => request<JourneyEvent[]>(patientPath(scope, 'journey')),
    goals: (scope: PatientScope) => request<Goal[]>(patientPath(scope, 'goals')),
    resources: (scope: PatientScope) =>
      request<ResourceAssignment[]>(patientPath(scope, 'resources')),
    patientUpdates: (scope: PatientScope) =>
      request<PatientUpdate[]>(patientPath(scope, 'patient-updates')),
    clinicalNotes: (scope: PatientScope) =>
      request<ClinicalProgressNote[]>(patientPath(scope, 'clinical-notes')),
    psychotherapyNotes: (scope: PatientScope) =>
      request<PsychotherapyNote[]>(patientPath(scope, 'psychotherapy-notes')),
    messages: (scope: PatientScope) => request<Message[]>(patientPath(scope, 'messages')),
    sendMessage: (scope: PatientScope, input: MessageInput) =>
      request<Message>(patientPath(scope, 'messages'), messageSchema.parse(input)),
    journal: (scope: PatientScope) => request<JournalEntry[]>(patientPath(scope, 'journal')),
    createJournalEntry: (scope: PatientScope, input: JournalEntryInput) =>
      request<JournalEntry>(patientPath(scope, 'journal'), journalEntrySchema.parse(input)),
    requestRecords: (scope: PatientScope, input: RecordsAccessRequestInput) =>
      request<RecordsAccessRequest>(
        patientPath(scope, 'records-access-requests'),
        recordsAccessRequestSchema.parse(input),
      ),
  };
}
/** Public UI fixture adapter. It has no security boundary or persistence. Never use with real data. */
function copyFixture<T>(value: T): T {
  // Fixture records contain only JSON values. Avoid relying on structuredClone in native runtimes.
  return JSON.parse(JSON.stringify(value)) as T;
}
export const demoService = {
  patients: async () => copyFixture(demoPatients),
  appointments: async (patientId?: string) =>
    copyFixture(demoAppointments.filter((item) => !patientId || item.patientId === patientId)),
  sessions: async (patientId: string) =>
    copyFixture(demoSessions.filter((item) => item.patientId === patientId && item.portalShared)),
  journey: async (patientId: string) =>
    copyFixture(demoJourney.filter((item) => item.patientId === patientId && item.portalShared)),
  goals: async (patientId: string) =>
    copyFixture(demoGoals.filter((item) => item.patientId === patientId && item.portalShared)),
  resources: async (patientId: string) =>
    copyFixture(demoResources.filter((item) => item.patientId === patientId)),
  messages: async (patientId: string) =>
    copyFixture(demoMessages.filter((item) => item.patientId === patientId)),
  patientUpdates: async (patientId: string) =>
    copyFixture(
      demoPatientUpdates.filter((item) => item.patientId === patientId && item.approvedAt !== null),
    ),
};
