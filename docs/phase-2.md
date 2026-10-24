# Phase 2 requirements

This records future requirements. Phase 2 implementation has not begun; none of these integrations is represented as operational in Phase 1.

## Establish production identity and storage first

1. Select an authentication provider and implement verified sessions, MFA, invitations/onboarding, recovery, and account lifecycle controls. Replace public demo identities with server-verified subjects.
2. Provision a separate development PostgreSQL/Supabase environment. Review and execute migrations there, implement repository adapters, and test precise least-privilege runtime roles.
3. Test tenant isolation, multi-practice membership, suspended access, clinical assignments, patient self-access, psychotherapy author rules, and private journal boundaries against database RLS. Add controlled write policies and transaction-local identity handling.
4. Implement durable audit storage, fail-closed sensitive actions, encryption/key management, private object storage, secrets management, monitoring, backup/restore, incident response, and retention/deletion.
5. Connect apps to the API through provider-backed clients and implement loading, errors, retry, pagination, and conflict handling. Replace temporary local mutations in production workflows.
6. Complete legal, operational, privacy, security, accessibility, and provider-agreement assessments before processing real patient information. Phase 1 does not establish HIPAA compliance.

## Complete clinical and practice workflows

- Scheduling with recurrence, availability, rescheduling, cancellation, time zones, and reminders.
- Intake, consent versioning, signatures, patient lifecycle, clinician assignments, and multi-practice membership management.
- Clinical progress notes with templates, signing, amendments, provenance, and lawful records-access handling.
- Separately maintained psychotherapy notes with dedicated storage, author restrictions, and independently reviewed policy.
- Treatment plans/goals, clinician approval and portal sharing of updates, and private journals with durable privacy controls.
- Journey search over authorized metadata, approved summaries, resources, exercises, goals, and reflections.
- Messaging delivery, attachments, conversation membership, read state, response expectations, nonclinical notifications, and emergency guidance.
- Records requests with identity checks, review, fulfillment, deadlines, auditing, and exceptions. Routine portal sharing remains a separate decision.
- Billing/payment provider, insurance/claims, statements/receipts, reporting, import/export, and practice administration. Verify each provider before enabling its action.

## Introduce optional media and AI deliberately

Recording stays disabled until explicit consent, participant authorization, secure storage/playback, clinician-controlled portal sharing, retention enforcement, and records-access policies are implemented and reviewed. Add a telehealth provider, transcripts, timecodes, bookmarks, and accessible replay after these prerequisites.

Optional AI needs a selected provider, agreements and data controls, scoped authorization, audit events, provenance, and evaluation. Notes/summaries must remain suggestions requiring clinician review; never silently sign or publish AI output. Phase 1 makes no external AI requests.

## Validate mobile and design in real environments

- Compare with the requested reference once the missing image is available.
- Run iPhone and Android builds on physical devices; check safe areas, keyboards, large text, screen readers, contrast, reduced motion, native navigation, and tablets.
- Implement secure native credential storage and provider login/deep links. Review background/device-loss behavior, offline records, and notification privacy before real use.
- Add automated device navigation and provider/database integration tests after adapters exist.
- Complete privacy disclosures, store configuration, signing, crash reporting, environment separation, and release procedures.

## Deploy after configuration and authorization

Prepare Coolify/VPS packaging once infrastructure, domains, database, authentication, storage, and services are selected. Configure TLS, network boundaries, least-privilege secrets, migrations, health checks, rollback, monitoring, and restore. Production deployment or migration requires explicit authorization and is outside Phase 1.
