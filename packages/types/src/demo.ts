import type {
  Appointment,
  Consent,
  Goal,
  IntakeForm,
  Invoice,
  JourneyEvent,
  Membership,
  Message,
  Notification,
  Organization,
  Patient,
  PatientClinicianAssignment,
  PatientUpdate,
  ResourceAssignment,
  Session,
  TreatmentPlan,
  User,
} from './index';

/** Public, invented fixtures for UI development. Never put real patient data here. */
export const demoOrganization: Organization = {
  id: 'org-demo',
  name: 'Willow Therapy',
  timezone: 'America/Los_Angeles',
  synthetic: true,
};
export const demoTherapist: User = {
  id: 'user-demo-therapist',
  displayName: 'Maya Chen',
  email: 'maya@example.invalid',
  initials: 'MC',
  synthetic: true,
};
export const demoPatientUser: User = {
  id: 'user-demo-patient',
  displayName: 'Avery Morgan',
  email: 'avery@example.invalid',
  initials: 'AM',
  synthetic: true,
};
export const demoUsers: User[] = [
  demoTherapist,
  demoPatientUser,
  {
    id: 'user-demo-owner',
    displayName: 'Jordan Ellis',
    email: 'jordan@example.invalid',
    initials: 'JE',
    synthetic: true,
  },
  {
    id: 'user-demo-admin',
    displayName: 'Sam Rivera',
    email: 'sam@example.invalid',
    initials: 'SR',
    synthetic: true,
  },
  {
    id: 'user-demo-billing',
    displayName: 'Alex Taylor',
    email: 'alex@example.invalid',
    initials: 'AT',
    synthetic: true,
  },
  {
    id: 'user-demo-patient-2',
    displayName: 'Jamie Park',
    email: 'jamie@example.invalid',
    initials: 'JP',
    synthetic: true,
  },
];
export const demoMemberships: Membership[] = demoUsers.map((user, i) => ({
  id: `membership-demo-${i + 1}`,
  organizationId: demoOrganization.id,
  userId: user.id,
  roles: [
    i === 0
      ? 'clinician'
      : i === 2
        ? 'owner'
        : i === 3
          ? 'administrator'
          : i === 4
            ? 'billing'
            : 'patient',
  ],
  status: 'active',
}));
export const demoPatient: Patient = {
  id: 'patient-demo-avery',
  organizationId: demoOrganization.id,
  userId: demoPatientUser.id,
  displayName: 'Avery Morgan',
  initials: 'AM',
  email: 'avery@example.invalid',
  status: 'active',
  synthetic: true,
};
export const demoPatients: Patient[] = [
  demoPatient,
  {
    id: 'patient-demo-jamie',
    organizationId: demoOrganization.id,
    userId: 'user-demo-patient-2',
    displayName: 'Jamie Park',
    initials: 'JP',
    email: 'jamie@example.invalid',
    status: 'active',
    synthetic: true,
  },
  {
    id: 'patient-demo-riley',
    organizationId: demoOrganization.id,
    userId: 'user-demo-riley',
    displayName: 'Riley Brooks',
    initials: 'RB',
    email: 'riley@example.invalid',
    status: 'active',
    synthetic: true,
  },
  {
    id: 'patient-demo-quinn',
    organizationId: demoOrganization.id,
    userId: 'user-demo-quinn',
    displayName: 'Quinn Davis',
    initials: 'QD',
    email: 'quinn@example.invalid',
    status: 'paused',
    synthetic: true,
  },
];
export const demoAssignments: PatientClinicianAssignment[] = demoPatients
  .slice(0, 3)
  .map((patient, i) => ({
    id: `assignment-demo-${i + 1}`,
    organizationId: demoOrganization.id,
    patientId: patient.id,
    clinicianId: demoTherapist.id,
    active: true,
  }));
export const demoAppointments: Appointment[] = [
  {
    id: 'appointment-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    clinicianId: demoTherapist.id,
    title: 'Individual therapy',
    startsAt: '2026-10-26T16:00:00-07:00',
    endsAt: '2026-10-26T16:50:00-07:00',
    status: 'confirmed',
    modality: 'telehealth',
  },
  {
    id: 'appointment-demo-2',
    organizationId: 'org-demo',
    patientId: 'patient-demo-jamie',
    clinicianId: demoTherapist.id,
    title: 'Individual therapy',
    startsAt: '2026-10-26T10:00:00-07:00',
    endsAt: '2026-10-26T10:50:00-07:00',
    status: 'scheduled',
    modality: 'in_person',
  },
  {
    id: 'appointment-demo-3',
    organizationId: 'org-demo',
    patientId: 'patient-demo-riley',
    clinicianId: demoTherapist.id,
    title: 'Individual therapy',
    startsAt: '2026-10-26T13:00:00-07:00',
    endsAt: '2026-10-26T13:50:00-07:00',
    status: 'confirmed',
    modality: 'telehealth',
  },
];
export const demoSessions: Session[] = [
  {
    id: 'session-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    clinicianId: demoTherapist.id,
    title: 'Making room for what matters',
    startsAt: '2026-10-19T16:00:00-07:00',
    durationMinutes: 50,
    themes: ['Boundaries', 'Self-compassion'],
    portalShared: true,
    recording: { enabled: false, consentStatus: 'not_requested', retentionDays: null },
  },
  {
    id: 'session-demo-2',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    clinicianId: demoTherapist.id,
    title: 'Finding a steadier rhythm',
    startsAt: '2026-10-12T16:00:00-07:00',
    durationMinutes: 50,
    themes: ['Mindfulness', 'Daily routines'],
    portalShared: true,
    recording: { enabled: false, consentStatus: 'not_requested', retentionDays: null },
  },
  {
    id: 'session-demo-3',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    clinicianId: demoTherapist.id,
    title: 'A place to begin',
    startsAt: '2026-10-05T16:00:00-07:00',
    durationMinutes: 50,
    themes: ['Connection', 'Values'],
    portalShared: false,
    recording: { enabled: false, consentStatus: 'not_requested', retentionDays: null },
  },
];
export const demoTreatmentPlans: TreatmentPlan[] = [
  {
    id: 'plan-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    clinicianId: demoTherapist.id,
    title: 'Building a little more balance',
    status: 'active',
    portalShared: true,
  },
];
export const demoGoals: Goal[] = [
  {
    id: 'goal-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    treatmentPlanId: 'plan-demo-1',
    title: 'Make space for yourself',
    description: 'Practice one small boundary each week.',
    progress: 65,
    status: 'active',
    portalShared: true,
  },
  {
    id: 'goal-demo-2',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    treatmentPlanId: 'plan-demo-1',
    title: 'Build a grounding routine',
    description: 'Pause for five quiet minutes, three days a week.',
    progress: 40,
    status: 'active',
    portalShared: true,
  },
  {
    id: 'goal-demo-3',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    treatmentPlanId: 'plan-demo-1',
    title: 'Notice what is going well',
    description: 'Bring one moment of progress to our next conversation.',
    progress: 80,
    status: 'active',
    portalShared: true,
  },
];
export const demoResources: ResourceAssignment[] = [
  {
    id: 'resource-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    assignedBy: demoTherapist.id,
    title: 'The five senses grounding exercise',
    description: 'A gentle way to come back to the present moment.',
    category: 'exercise',
    status: 'assigned',
    durationMinutes: 5,
  },
  {
    id: 'resource-demo-2',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    assignedBy: demoTherapist.id,
    title: 'Your values, in everyday life',
    description: 'Notice the small choices that feel like you.',
    category: 'worksheet',
    status: 'assigned',
    durationMinutes: 10,
  },
];
export const demoPatientUpdates: PatientUpdate[] = [
  {
    id: 'update-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    sessionId: 'session-demo-1',
    authorId: demoTherapist.id,
    title: 'A small step for this week',
    content:
      'Notice one moment when you pause before saying yes. We can explore what you notice next time.',
    approvedAt: '2026-10-19T18:00:00-07:00',
  },
];
export const demoJourney: JourneyEvent[] = [
  {
    id: 'journey-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    type: 'session',
    title: 'Making room for what matters',
    description: 'A conversation about boundaries and treating yourself with kindness.',
    occurredAt: '2026-10-19T16:00:00-07:00',
    themes: ['Boundaries', 'Self-compassion'],
    portalShared: true,
  },
  {
    id: 'journey-demo-2',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    type: 'resource',
    title: 'A moment to feel grounded',
    description: 'A five-minute exercise to try between sessions.',
    occurredAt: '2026-10-15T12:00:00-07:00',
    themes: ['Mindfulness'],
    portalShared: true,
  },
  {
    id: 'journey-demo-3',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    type: 'session',
    title: 'Finding a steadier rhythm',
    description: 'Making room for simple routines that support you.',
    occurredAt: '2026-10-12T16:00:00-07:00',
    themes: ['Daily routines'],
    portalShared: true,
  },
];
export const demoMessages: Message[] = [
  {
    id: 'message-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    senderId: demoTherapist.id,
    recipientId: demoPatientUser.id,
    content:
      'Hi Avery, I shared the grounding exercise we discussed. There is no rush—try it when you have a quiet moment.',
    sentAt: '2026-10-21T10:30:00-07:00',
    read: false,
  },
];
export const demoNotifications: Notification[] = [
  {
    id: 'notification-demo-1',
    organizationId: 'org-demo',
    userId: demoPatientUser.id,
    title: 'A new resource for you',
    description: 'Maya shared a grounding exercise.',
    createdAt: '2026-10-21T10:30:00-07:00',
    read: false,
  },
];
export const demoConsents: Consent[] = [
  {
    id: 'consent-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    purpose: 'treatment',
    status: 'granted',
    policyVersion: 'demo-1',
    recordedAt: '2026-10-01T12:00:00-07:00',
  },
  {
    id: 'consent-demo-2',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    purpose: 'recording',
    status: 'pending',
    policyVersion: 'demo-1',
    recordedAt: null,
  },
];
export const demoInvoices: Invoice[] = [
  {
    id: 'invoice-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    description: 'Individual therapy · October 19',
    amountCents: 15000,
    currency: 'USD',
    status: 'paid',
    issuedAt: '2026-10-19T18:00:00-07:00',
  },
];
export const demoForms: IntakeForm[] = [
  {
    id: 'form-demo-1',
    organizationId: 'org-demo',
    patientId: demoPatient.id,
    title: 'Your preferences and goals',
    status: 'not_started',
    dueAt: null,
  },
];
