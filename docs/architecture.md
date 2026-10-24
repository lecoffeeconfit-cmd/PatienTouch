# Patient Touch architecture

## Phase 1 layout

The npm workspace contains independently runnable Next.js and Expo clients, a loopback Fastify API, and shared TypeScript packages. Both clients can render public synthetic fixtures without an API or database. They share types, Zod input validation and design identity; native and browser rendering/navigation remain platform-specific.

`packages/types` contains role, membership, patient, appointment, session, note, journey, plan, goal, consent, resource, message, records-request, billing and audit contracts. `@patient-touch/types/demo` is the clearly labeled public invented dataset. Private clinical-note fixtures exist only inside the demo API store. No package contains real patient data.

`packages/schemas` validates client inputs and rejects unknown fields. `packages/auth` defines provider interfaces and centralized patient-scoped authorization. `packages/api-client` provides a typed fetch client with explicit base URL and a separately labeled public fixture adapter. Demo identities may be sent only to loopback API URLs. Tokens from an eventual verified authentication provider have a separate interface; the current server does not implement provider auth.

The backend is created through `buildApp()` so request-level tests can exercise real routing without opening a network socket. It owns identity selection, tenant/role/patient checks, message routing, private journal creation, reviewed records-request creation and audit events. Data resets when the process restarts. Demo messages have no actual delivery guarantee or background worker.

## Domain boundaries

- **Clinical progress notes:** ordinary clinical documentation, with future signing and amendment rules.
- **Psychotherapy notes:** separately maintained author-only data and policy. Never repurposed as progress notes or patient summaries.
- **Patient updates:** clinician-authored material requiring explicit approval before routine portal display.
- **Patient journal:** a private reflection surface; the API excludes clinicians and operations staff.
- **Journey:** chronological, searchable portal-safe session/resource/update/goal metadata. Recording/transcript/bookmark contracts can be extended without collapsing note privacy boundaries.
- **Recording:** metadata only, disabled in app and database. Consent alone does not activate capture.
- **AI:** disabled service interface; future suggestions carry `requires_clinician_review` status.

## API contract

`GET /health` describes the synthetic demo boundary. `GET /v1/demo/session` resolves the allowlisted `X-Demo-User`. All patient data lives under `/v1/organizations/:organizationId/patients/:patientId`. Collections include appointments, sessions, journey, goals, resources, messages, patient-updates, clinical-notes, psychotherapy-notes, treatment-plans, consents, invoices, forms, journal and records-access-requests. The tenant directory is `GET /v1/organizations/:organizationId/patients`.

GET results use `{ data, demo: true }`. POST is implemented only for messages, journal and records-access-requests. Strict inputs contain only content fields; identity, tenant and sharing decisions are server-derived. Successful POST returns 201. Errors use `{ error: { code, message, requestId } }`, with 401 for missing demo identity, 403 for denied scope, 404 for unknown tenant-scoped records, and 400 for invalid input.

## Future adapters

PostgreSQL/Supabase is represented by a review-only SQL migration with RLS and compound tenant relationships. A repository adapter, migrations runner and provider authentication are intentionally required before non-demo runtime can start. Use an ordinary non-owner NOBYPASSRLS database role and transaction-local verified identity context. API authorization remains required alongside database enforcement.

Coolify deployment is an eventual packaging target; Phase 1 defines no domain, live service, database, endpoint or secret. The web/mobile fixture experience is independent of the backend, while the typed API contract allows an explicit future integration. Production notification delivery, telehealth, payments, claims, import/export, recording, durable storage, audit and AI remain Phase 2 integrations rather than simulated live services.
