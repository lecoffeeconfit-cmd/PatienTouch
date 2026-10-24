import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { MemoryAuditLogger, disabledAiService } from '../src/audit';
import { createDemoStore } from '../src/demo-store';

const apps: ReturnType<typeof buildApp>[] = [];
function server() {
  const audit = new MemoryAuditLogger();
  const store = createDemoStore();
  const app = buildApp({ audit, store });
  apps.push(app);
  return { app, audit, store };
}
const path = '/v1/organizations/org-demo/patients/patient-demo-avery';
const clinician = { 'x-demo-user': 'user-demo-therapist' };
const patient = { 'x-demo-user': 'user-demo-patient' };
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});
describe('synthetic API boundary', () => {
  it('rejects production modes and keeps recording/AI disabled', async () => {
    expect(() => buildApp({ mode: 'production' })).toThrow(/Only APP_MODE=demo/);
    const { app } = server();
    expect((await app.inject({ url: '/health' })).json()).toMatchObject({
      mode: 'local-synthetic-demo',
      recordingEnabled: false,
      aiEnabled: false,
    });
    await expect(
      disabledAiService.propose({
        organizationId: 'org-demo',
        patientId: 'patient-demo-avery',
        task: 'session_summary',
      }),
    ).rejects.toThrow(/disabled/);
  });
  it('requires a known demo identity and rejects remote browser origins', async () => {
    const { app } = server();
    expect((await app.inject({ url: path })).statusCode).toBe(401);
    expect(
      (await app.inject({ url: path, headers: { ...patient, origin: 'https://external.example' } }))
        .statusCode,
    ).toBe(403);
    const response = await app.inject({
      url: path,
      headers: { ...patient, origin: 'http://localhost:3000' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it("denies cross-tenant and another patient's reads and logs the denial", async () => {
    const { app, audit } = server();
    expect(
      (await app.inject({ url: path.replace('org-demo', 'other-org'), headers: clinician }))
        .statusCode,
    ).toBe(403);
    expect(
      (await app.inject({ url: path, headers: { 'x-demo-user': 'user-demo-patient-2' } }))
        .statusCode,
    ).toBe(403);
    expect(audit.events.filter((event) => event.action === 'access_denied')).toHaveLength(2);
  });
  it('separates clinical and psychotherapy notes from portal-visible material', async () => {
    const { app, store } = server();
    store.psychotherapyNotes.push({
      ...store.psychotherapyNotes[0]!,
      id: 'other-note',
      authorId: 'other-clinician',
    });
    for (const suffix of ['clinical-notes', 'psychotherapy-notes'])
      expect((await app.inject({ url: `${path}/${suffix}`, headers: patient })).statusCode).toBe(
        403,
      );
    expect(
      (
        await app.inject({
          url: `${path}/clinical-notes`,
          headers: { 'x-demo-user': 'user-demo-owner' },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (await app.inject({ url: `${path}/psychotherapy-notes`, headers: clinician })).json().data,
    ).toHaveLength(1);
    expect(
      (await app.inject({ url: `${path}/sessions`, headers: patient })).json().data,
    ).toHaveLength(2);
    expect(
      (await app.inject({ url: `${path}/sessions`, headers: clinician })).json().data,
    ).toHaveLength(3);
    store.patientUpdates.push({
      ...store.patientUpdates[0]!,
      id: 'draft-update',
      approvedAt: null,
    });
    expect(
      (await app.inject({ url: `${path}/patient-updates`, headers: patient })).json().data,
    ).toHaveLength(1);
  });
  it('assigns message identity on the server and rejects forged fields', async () => {
    const { app, audit } = server();
    const invalid = await app.inject({
      method: 'POST',
      url: `${path}/messages`,
      headers: patient,
      payload: { content: 'Demo', senderId: 'forged' },
    });
    expect(invalid.statusCode).toBe(400);
    const response = await app.inject({
      method: 'POST',
      url: `${path}/messages`,
      headers: patient,
      payload: { content: 'A synthetic check-in' },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().data).toMatchObject({
      senderId: 'user-demo-patient',
      recipientId: 'user-demo-therapist',
      organizationId: 'org-demo',
    });
    expect(JSON.stringify(audit.events)).not.toContain('synthetic check-in');
  });
  it('keeps journals patient-private and makes record requests a reviewed workflow', async () => {
    const { app } = server();
    const entry = await app.inject({
      method: 'POST',
      url: `${path}/journal`,
      headers: patient,
      payload: { title: 'Demo reflection', content: 'An invented reflection' },
    });
    expect(entry.statusCode).toBe(201);
    expect(entry.json().data.visibility).toBe('patient_private');
    expect((await app.inject({ url: `${path}/journal`, headers: clinician })).statusCode).toBe(403);
    const request = await app.inject({
      method: 'POST',
      url: `${path}/records-access-requests`,
      headers: patient,
      payload: { scope: 'clinical_record' },
    });
    expect(request.statusCode).toBe(201);
    expect(request.json().data.status).toBe('submitted');
    expect(JSON.stringify(request.json())).not.toContain('clinical_progress');
  });
  it('does not expose conversations to an assigned clinician who is not a participant', async () => {
    const { app, store } = server();
    store.messages.push({
      ...store.messages[0]!,
      id: 'other-thread',
      senderId: 'other-clinician',
      recipientId: 'other-patient-user',
    });
    const response = await app.inject({ url: `${path}/messages`, headers: clinician });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(1);
  });
  it('fails closed without mutating data if audit persistence fails', async () => {
    const store = createDemoStore();
    const before = store.messages.length;
    const app = buildApp({
      store,
      audit: {
        async write() {
          throw new Error('Audit sink unavailable');
        },
      },
    });
    apps.push(app);
    const response = await app.inject({
      method: 'POST',
      url: `${path}/messages`,
      headers: patient,
      payload: { content: 'Synthetic audit check' },
    });
    expect(response.statusCode).toBe(500);
    expect(response.json().error.message).not.toContain('Audit sink');
    expect(store.messages).toHaveLength(before);
  });
});
