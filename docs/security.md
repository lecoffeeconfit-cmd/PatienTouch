# Security foundation and limits

Patient Touch Phase 1 contains invented demo data only. It is not a production authentication system and makes no HIPAA compliance claim. Never enter real patient information into the browser, mobile app, API, journals, messages, or fixture files.

## Identity and authorization

The API runs only with `APP_MODE=demo` and binds to loopback. It refuses another mode or a non-loopback listen host. Requests select an allowlisted synthetic user with `X-Demo-User`; this is a demo switch anyone on the local machine can use. It is explicitly not secure authentication. Browser origins are restricted to loopback origins. No wildcard CORS, external AI, recording, database, payment, telehealth, or delivery provider is enabled.

`packages/auth` defines the authentication adapter contract and patient authorization rules. A real provider must validate signature, issuer, audience, expiration, session revocation and MFA/account recovery requirements before constructing a trusted identity. Tenant membership and patient assignments must come from authoritative server storage. Password fields in the UI do not create accounts or validate credentials.

Each API request rechecks active organization membership and the requested patient's organization. Clinicians require an active assignment. Owners/administrators can read operational patient-directory and scheduling data; their title alone grants no clinical note, journal, or psychotherapy access. Billing can read invoice data, with no clinical access. Patients can read only their own portal material. Responses use `Cache-Control: no-store`. Input schemas reject extra identity and tenant fields; message senders and recipients are set by the server.

| Data concept                   | Local API access                                                          |
| ------------------------------ | ------------------------------------------------------------------------- |
| Clinical progress notes        | Assigned clinician; ordinary record-access workflow remains separate      |
| Psychotherapy notes            | Assigned clinician who authored the note                                  |
| Patient-facing update          | Assigned clinician; patient only after approval                           |
| Session, journey, plan or goal | Assigned clinician; patient only when portal-shared                       |
| Private journal                | Patient author only; no clinician or practice-owner fallback              |
| Messages                       | Authorized patient/assigned clinician and participant in the conversation |
| Invoice metadata               | Patient self, billing, owner or administrator                             |

Routine portal sharing is distinct from lawful patient-record access. A submitted records request creates a pending review item; it does not release clinical or psychotherapy notes. No automated decision about legal access is implemented. No real storage, retention execution, export, or erasure workflow exists yet.

## Audit

`AuditLogger` is an interface; `MemoryAuditLogger` is volatile demo/test storage. API patient reads, content creation, directory reads and authorization denials create minimal audit events. Audit writes are awaited before a successful response or mutation. Events contain actor, tenant, action, resource IDs, outcome, time and request ID, never note/message/journal content, passwords or tokens. This sink is not durable or production-ready.

A production adapter must durably audit sign-in/session/security changes, denied access, sensitive reads, record creation/amendment/signing, exports/downloads, sharing changes, recordings/playback, consent changes, role/assignment changes, records-request decisions, AI access/review and administrative actions. Audit visibility must be restricted, protected against update/deletion, monitored and covered by retention and incident-response policies. Audit failure must fail closed for sensitive operations.

## Database and deployment

The review-only PostgreSQL migration includes tenant compound foreign keys and default-deny RLS. It is not connected to the demo API. See `infrastructure/README.md` for ownership, trusted identity-context and grant requirements. Database role/ownership tests and migration execution require a newly provisioned development PostgreSQL environment and remain outstanding.

Production work also requires encryption and key management, private object storage with authorized expiring access, durable audit, tested backups and disaster recovery, secrets management, provider agreements, tenant isolation tests against the real database, penetration testing, monitoring, secure notifications without clinical content, rate limiting, CSRF/session design, authorization review, consent/retention policies and legal/operational assessment. No production deployment occurs in Phase 1.

## Communication and optional features

Demo messages do not leave the current process/device and are not monitored. The product must show response expectations and direct emergencies to local emergency services. Recording remains disabled even if a consent record exists. Transcript and replay screens are shells; no recording links are issued. `ClinicalAiService` exposes only a disabled adapter. Future AI outputs must stay suggestions requiring clinician review and must never silently become signed notes.
