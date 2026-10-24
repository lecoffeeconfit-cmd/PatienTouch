# Testing and verification

All data is invented. Do not use patient information, real credentials, or provider secrets in tests.

## Repeatable commands

Run from `/Users/howieday/PatienTouch` after `npm ci`:

| Command                           | What it checks                               |
| --------------------------------- | -------------------------------------------- |
| `npm run typecheck`               | Shared packages and all apps                 |
| `npm run lint`                    | Source and test lint rules                   |
| `npm test`                        | API authorization, schema, and package tests |
| `npm run build:web`               | Next.js production-format route compilation  |
| `npm run build:api`               | API TypeScript build check                   |
| `npm run check:mobile`            | React Native types and Expo exports          |
| `npx playwright install chromium` | Browser dependency setup                     |
| `npm run test:e2e`                | Chromium route and interaction checks        |
| `npm run format:check`            | Source formatting                            |

Playwright starts `npm run dev:web` at `http://127.0.0.1:3000` or reuses an existing server outside CI. It uses Chromium with the Los Angeles time zone, retains failure traces/screenshots, and writes `playwright-report/`. Open it with `npx playwright show-report`. A single worker avoids competing development compilations.

## Automated scope

- Every configured workspace route, synthetic patient profile, therapist session, and portal-shared session/replay route must return 200 and render a main landmark, heading, synthetic disclosure, and demo banner.
- Therapist primary/secondary navigation, patient role switching, and journey navigation.
- Local scheduling adds an appointment with a clear temporary lifetime; refresh restores fixtures.
- Caseload and journey searches return matches and empty states.
- Workspace search navigation and Escape-to-dismiss dialogs.
- Journal creation/refresh reset with an explicit insecure-demo disclosure.
- Messages appear as undelivered local previews and reset on refresh.
- Navigation stays reachable at a narrow phone-sized browser viewport.
- API tests exercise missing identity, origin restrictions, cross-tenant/other-patient access, clinical/psychotherapy separation, approval-based sharing, forged input rejection, server-derived identities, private journals, and reviewed records requests.
- Authorization tests cover roles, active assignments/membership, multiple roles, authorship, and tenant boundaries.

Browser checks verify the synthetic UI. They do not prove production authentication, persisted app/API integration, provider delivery, or clinical privacy compliance.

## Phase 1 execution record

Validation is being performed during implementation. Final command outcomes and environment limits will be recorded here before handoff. A command listed above is not, by itself, a claim that it passed.

## Device and external-environment verification

These require environments not established by a bundle export or browser test:

- Physical iPhone/Android installation, gestures, keyboard behavior, safe areas, screen readers, large text, reduced motion, and native runtime behavior.
- Expo Go/development-build compatibility and simulator/emulator launch with native tooling.
- PostgreSQL migration execution/reversion, exact-role RLS, transactional audit persistence, backup/restore, and connection-pool identity reset.
- Provider authentication, invitations, recovery, MFA/revocation, and secure native session storage.
- Payment/insurance/telehealth, push/email/message delivery, attachments, recording/transcripts/playback, storage URLs, and external AI. These are disabled or unconnected.
- Comparison against the requested reference image, absent from the available attachment.
- Security/penetration review, legal/operational requirements, accessibility assessment, and production release verification.

No production migration, patient processing, deployment, or device-installation success is implied by automated checks.
