import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyRequest } from 'fastify';
import {
  AuthorizationError,
  canAccessPatient,
  requireMembership,
  requirePatientAccess,
  type Capability,
} from '@patient-touch/auth';
import {
  journalEntrySchema,
  messageSchema,
  recordsAccessRequestSchema,
} from '@patient-touch/schemas';
import type { AuditLogger, AuthenticatedIdentity, DemoSession } from '@patient-touch/types';
import { demoMemberships, demoOrganization, demoUsers } from '@patient-touch/types/demo';
import { MemoryAuditLogger } from './audit';
import { createDemoStore, type DemoStore } from './demo-store';

class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
type PatientParams = { organizationId: string; patientId: string };
type PatientRequest = FastifyRequest<{ Params: PatientParams }>;
interface AppOptions {
  mode?: string;
  audit?: AuditLogger;
  store?: DemoStore;
}

/** The only runnable adapter in Phase 1 is explicitly local synthetic demo. */
export function buildApp(options: AppOptions = {}) {
  if ((options.mode ?? 'demo') !== 'demo')
    throw new Error(
      'Only APP_MODE=demo is implemented. Configure and verify a production adapter before enabling another mode.',
    );
  const app = Fastify({ logger: false, bodyLimit: 65536, requestTimeout: 15000 });
  const audit = options.audit ?? new MemoryAuditLogger();
  const store = options.store ?? createDemoStore();

  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Patient-Touch-Mode', 'local-synthetic-demo');
    const origin = request.headers.origin;
    if (origin) {
      let parsed: URL;
      try {
        parsed = new URL(origin);
      } catch {
        throw new HttpError(403, 'ORIGIN_REJECTED', 'Origin is not allowed in local demo mode.');
      }
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
      )
        throw new HttpError(403, 'ORIGIN_REJECTED', 'Origin is not allowed in local demo mode.');
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Vary', 'Origin');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, X-Demo-User');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (request.method === 'OPTIONS') return reply.code(204).send();
  });
  app.setErrorHandler(async (error, request, reply) => {
    const frameworkStatus =
      error instanceof Error && 'statusCode' in error ? error.statusCode : undefined;
    const status =
      error instanceof AuthorizationError
        ? 403
        : error instanceof HttpError
          ? error.statusCode
          : frameworkStatus === 400 || frameworkStatus === 413
            ? frameworkStatus
            : 500;
    const code =
      error instanceof HttpError
        ? error.code
        : status === 403
          ? 'ACCESS_DENIED'
          : status === 400
            ? 'INVALID_INPUT'
            : status === 413
              ? 'PAYLOAD_TOO_LARGE'
              : 'INTERNAL_ERROR';
    const message =
      error instanceof HttpError || error instanceof AuthorizationError
        ? error.message
        : status === 400
          ? 'The request body is invalid.'
          : status === 413
            ? 'The request body is too large.'
            : 'The request could not be completed.';
    return reply.code(status).send({ error: { code, message, requestId: request.id } });
  });
  app.setNotFoundHandler(async (request, reply) =>
    reply.code(404).send({
      error: { code: 'NOT_FOUND', message: 'Resource not found.', requestId: request.id },
    }),
  );
  function identity(request: FastifyRequest): AuthenticatedIdentity {
    const userId = request.headers['x-demo-user'];
    if (typeof userId !== 'string' || !demoUsers.some((user) => user.id === userId))
      throw new HttpError(
        401,
        'DEMO_IDENTITY_REQUIRED',
        'Select a synthetic demo identity using X-Demo-User.',
      );
    return {
      userId,
      authentication: 'local-synthetic-demo',
      memberships: demoMemberships.filter((membership) => membership.userId === userId),
    };
  }
  async function log(
    request: FastifyRequest,
    actor: AuthenticatedIdentity,
    organizationId: string,
    action: 'read' | 'create' | 'access_denied',
    resourceType: string,
    resourceId?: string,
  ) {
    await audit.write({
      id: randomUUID(),
      actorId: actor.userId,
      organizationId,
      action,
      resourceType,
      ...(resourceId ? { resourceId } : {}),
      outcome: action === 'access_denied' ? 'denied' : 'allowed',
      occurredAt: new Date().toISOString(),
      requestId: request.id,
    });
  }
  async function patientContext(request: PatientRequest, capability: Capability) {
    const actor = identity(request);
    const { organizationId, patientId } = request.params;
    try {
      requireMembership(actor, organizationId);
      const patient = store.patients.find(
        (item) => item.organizationId === organizationId && item.id === patientId,
      );
      if (!patient) throw new HttpError(404, 'NOT_FOUND', 'Resource not found.');
      requirePatientAccess({
        identity: actor,
        organizationId,
        patient,
        assignments: store.assignments,
        capability,
      });
      return { actor, patient, organizationId };
    } catch (error) {
      await log(request, actor, organizationId, 'access_denied', capability, patientId);
      throw error;
    }
  }
  const envelope = <T>(data: T) => ({ data, demo: true as const });
  app.get('/health', async () => ({
    status: 'ok',
    mode: 'local-synthetic-demo',
    data: 'synthetic-only',
    persistence: 'in-memory',
    recordingEnabled: false,
    aiEnabled: false,
  }));
  app.get('/v1/demo/session', async (request) => {
    const actor = identity(request);
    const session: DemoSession = {
      mode: 'local-synthetic-demo',
      user: demoUsers.find((user) => user.id === actor.userId)!,
      memberships: actor.memberships,
      organization: demoOrganization,
      recordingEnabled: false,
      aiEnabled: false,
    };
    return envelope(session);
  });
  app.get<{ Params: { organizationId: string } }>(
    '/v1/organizations/:organizationId/patients',
    async (request) => {
      const actor = identity(request);
      const { organizationId } = request.params;
      try {
        requireMembership(actor, organizationId);
      } catch (error) {
        await log(request, actor, organizationId, 'access_denied', 'patients');
        throw error;
      }
      const patients = store.patients.filter((patient) =>
        canAccessPatient({
          identity: actor,
          organizationId,
          patient,
          assignments: store.assignments,
          capability: 'patient_directory',
        }),
      );
      await log(request, actor, organizationId, 'read', 'patient_directory');
      return envelope(patients);
    },
  );
  app.get<{ Params: PatientParams }>(
    '/v1/organizations/:organizationId/patients/:patientId',
    async (request) => {
      const context = await patientContext(request, 'patient_directory');
      await log(
        request,
        context.actor,
        context.organizationId,
        'read',
        'patient',
        context.patient.id,
      );
      return envelope(context.patient);
    },
  );
  type Collection =
    | 'appointments'
    | 'sessions'
    | 'journey'
    | 'goals'
    | 'resources'
    | 'messages'
    | 'patientUpdates'
    | 'clinicalNotes'
    | 'treatmentPlans'
    | 'consents'
    | 'invoices'
    | 'forms'
    | 'journal'
    | 'recordsAccessRequests';
  const collectionRoutes: { path: string; collection: Collection; capability: Capability }[] = [
    { path: 'appointments', collection: 'appointments', capability: 'scheduling' },
    { path: 'sessions', collection: 'sessions', capability: 'portal' },
    { path: 'journey', collection: 'journey', capability: 'portal' },
    { path: 'goals', collection: 'goals', capability: 'portal' },
    { path: 'resources', collection: 'resources', capability: 'portal' },
    { path: 'messages', collection: 'messages', capability: 'messaging' },
    { path: 'patient-updates', collection: 'patientUpdates', capability: 'portal' },
    { path: 'clinical-notes', collection: 'clinicalNotes', capability: 'clinical' },
    { path: 'treatment-plans', collection: 'treatmentPlans', capability: 'portal' },
    { path: 'consents', collection: 'consents', capability: 'portal' },
    { path: 'invoices', collection: 'invoices', capability: 'billing' },
    { path: 'forms', collection: 'forms', capability: 'portal' },
    { path: 'journal', collection: 'journal', capability: 'journal' },
    { path: 'records-access-requests', collection: 'recordsAccessRequests', capability: 'journal' },
  ];
  for (const route of collectionRoutes) {
    app.get<{ Params: PatientParams }>(
      `/v1/organizations/:organizationId/patients/:patientId/${route.path}`,
      async (request) => {
        const { actor, patient, organizationId } = await patientContext(request, route.capability);
        const self = patient.userId === actor.userId;
        const data = store[route.collection]
          .filter((item) => item.organizationId === organizationId && item.patientId === patient.id)
          .filter(
            (item) =>
              !self ||
              ((!('portalShared' in item) || item.portalShared) &&
                (!('approvedAt' in item) || item.approvedAt !== null)),
          )
          .filter(
            (item) =>
              route.collection !== 'messages' ||
              !('senderId' in item) ||
              item.senderId === actor.userId ||
              item.recipientId === actor.userId,
          );
        await log(request, actor, organizationId, 'read', route.collection, patient.id);
        return envelope(data);
      },
    );
  }
  app.get<{ Params: PatientParams }>(
    '/v1/organizations/:organizationId/patients/:patientId/psychotherapy-notes',
    async (request) => {
      const { actor, patient, organizationId } = await patientContext(request, 'clinical');
      const data = store.psychotherapyNotes.filter(
        (note) =>
          note.organizationId === organizationId &&
          note.patientId === patient.id &&
          canAccessPatient({
            identity: actor,
            organizationId,
            patient,
            assignments: store.assignments,
            capability: 'psychotherapy',
            authorId: note.authorId,
          }),
      );
      await log(request, actor, organizationId, 'read', 'psychotherapy_notes', patient.id);
      return envelope(data);
    },
  );
  app.post<{ Params: PatientParams }>(
    '/v1/organizations/:organizationId/patients/:patientId/messages',
    async (request, reply) => {
      const { actor, patient, organizationId } = await patientContext(request, 'messaging');
      const parsed = messageSchema.safeParse(request.body);
      if (!parsed.success)
        throw new HttpError(
          400,
          'INVALID_INPUT',
          'Enter a message of 1 to 4,000 characters. Identity fields are not accepted.',
        );
      const assignment = store.assignments.find(
        (item) =>
          item.organizationId === organizationId && item.patientId === patient.id && item.active,
      );
      if (!assignment)
        throw new HttpError(
          409,
          'RECIPIENT_UNAVAILABLE',
          'No assigned clinician is available in this demo.',
        );
      const message = {
        id: randomUUID(),
        organizationId,
        patientId: patient.id,
        senderId: actor.userId,
        recipientId: actor.userId === patient.userId ? assignment.clinicianId : patient.userId,
        content: parsed.data.content,
        sentAt: new Date().toISOString(),
        read: false,
      };
      await log(request, actor, organizationId, 'create', 'message', message.id);
      store.messages.push(message);
      return reply.code(201).send(envelope(message));
    },
  );
  app.post<{ Params: PatientParams }>(
    '/v1/organizations/:organizationId/patients/:patientId/journal',
    async (request, reply) => {
      const { actor, patient, organizationId } = await patientContext(request, 'journal');
      const parsed = journalEntrySchema.safeParse(request.body);
      if (!parsed.success)
        throw new HttpError(
          400,
          'INVALID_INPUT',
          'A title and reflection are required. Identity and sharing fields are not accepted.',
        );
      const entry = {
        ...parsed.data,
        id: randomUUID(),
        organizationId,
        patientId: patient.id,
        authorUserId: actor.userId,
        createdAt: new Date().toISOString(),
        visibility: 'patient_private' as const,
      };
      await log(request, actor, organizationId, 'create', 'journal_entry', entry.id);
      store.journal.push(entry);
      return reply.code(201).send(envelope(entry));
    },
  );
  app.post<{ Params: PatientParams }>(
    '/v1/organizations/:organizationId/patients/:patientId/records-access-requests',
    async (request, reply) => {
      const { actor, patient, organizationId } = await patientContext(request, 'journal');
      const parsed = recordsAccessRequestSchema.safeParse(request.body);
      if (!parsed.success)
        throw new HttpError(400, 'INVALID_INPUT', 'Choose a valid records request scope.');
      const record = {
        ...parsed.data,
        id: randomUUID(),
        organizationId,
        patientId: patient.id,
        requestedBy: actor.userId,
        status: 'submitted' as const,
        createdAt: new Date().toISOString(),
      };
      await log(request, actor, organizationId, 'create', 'records_access_request', record.id);
      store.recordsAccessRequests.push(record);
      return reply.code(201).send(envelope(record));
    },
  );
  return app;
}
