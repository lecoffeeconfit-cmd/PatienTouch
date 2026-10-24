import type {
  ClinicalProgressNote,
  JournalEntry,
  PsychotherapyNote,
  RecordsAccessRequest,
} from '@patient-touch/types';
import {
  demoAppointments,
  demoAssignments,
  demoConsents,
  demoForms,
  demoGoals,
  demoInvoices,
  demoJourney,
  demoMessages,
  demoPatientUpdates,
  demoPatients,
  demoResources,
  demoSessions,
  demoTreatmentPlans,
} from '@patient-touch/types/demo';

/** Volatile synthetic data only. Each server instance gets its own copy. */
export function createDemoStore() {
  return structuredClone({
    patients: demoPatients,
    assignments: demoAssignments,
    appointments: demoAppointments,
    sessions: demoSessions,
    journey: demoJourney,
    goals: demoGoals,
    resources: demoResources,
    messages: demoMessages,
    patientUpdates: demoPatientUpdates,
    consents: demoConsents,
    treatmentPlans: demoTreatmentPlans,
    invoices: demoInvoices,
    forms: demoForms,
    clinicalNotes: [
      {
        id: 'clinical-demo-1',
        organizationId: 'org-demo',
        patientId: 'patient-demo-avery',
        sessionId: 'session-demo-1',
        authorId: 'user-demo-therapist',
        kind: 'clinical_progress',
        content:
          'Synthetic draft: reviewed a grounding practice and agreed on a small between-session goal.',
        status: 'draft',
        createdAt: '2026-10-19T18:00:00-07:00',
      },
    ] as ClinicalProgressNote[],
    psychotherapyNotes: [
      {
        id: 'psychotherapy-demo-1',
        organizationId: 'org-demo',
        patientId: 'patient-demo-avery',
        sessionId: 'session-demo-1',
        authorId: 'user-demo-therapist',
        kind: 'psychotherapy',
        content: 'Synthetic separately maintained process note. Author-only access.',
        createdAt: '2026-10-19T18:05:00-07:00',
      },
    ] as PsychotherapyNote[],
    journal: [] as JournalEntry[],
    recordsAccessRequests: [] as RecordsAccessRequest[],
  });
}
export type DemoStore = ReturnType<typeof createDemoStore>;
