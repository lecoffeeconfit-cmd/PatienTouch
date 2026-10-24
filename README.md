# Patient Touch

Patient Touch is a therapy practice-management foundation with a Next.js browser app, an Expo iOS/Android app, a local Fastify API, and shared TypeScript packages. Phase 1 provides therapist and patient workspaces, representative synthetic workflows, and an extensible authorization/database design.

**This is a local synthetic demo.** No production authentication provider or database is configured. Use invented sample information only. Demo role switches do not authenticate users. Browser and mobile changes are temporary; messages are not delivered. Recording, external AI, payments, insurance, telehealth calls, and notifications are not connected. No HIPAA compliance claim is made.

The requested design-reference image was not included in the available attachment. The implementation uses the supplied navy, teal, green, mint, gray, and white palette and written design direction; a reference-image comparison remains outstanding.

## Setup

Use Node.js **22.13 or newer** and npm **10 or newer**. Run commands from the existing repository root:

```sh
cd /Users/howieday/PatienTouch
npm ci
```

`npm ci` installs the recorded lockfile versions. Use `npm install` when intentionally updating dependencies, then review the lockfile. No database, Supabase project, credentials, domain, or API connection is needed to explore the apps.

## Run the browser app

```sh
npm run dev:web
```

Open [the local browser app](http://127.0.0.1:3000). The Next.js app binds to loopback. Start at `/therapist/today`, `/patient/home`, or `/login`; use the demo switch to explore either workspace. Therapist navigation includes **Practice & clinical**; patient navigation includes **Account & more**.

Synthetic appointments, journal entries, messages, and local selections reset when the relevant page reloads or unmounts. The browser fixture experience runs independently of the API.

For a production-format local web build:

```sh
npm run build:web
npm run start --workspace=@patient-touch/web
```

This builds the application bundle; it does not configure production authentication or make the demo suitable for real records.

## Run the mobile app

```sh
npm run dev:mobile
```

Expo opens its development server. Use its terminal options to launch an available iOS simulator, Android emulator, or supported Expo Go client. iOS simulator execution requires macOS and Xcode; Android requires an emulator/device and Android tooling. A physical device must be able to reach the development computer.

```sh
npm run ios --workspace=@patient-touch/mobile
npm run android --workspace=@patient-touch/mobile
npm run web --workspace=@patient-touch/mobile
```

Choose the demo role in **More**. Therapist tabs are Today, Calendar, Patients, Messages, and More. Patient tabs are Home, My Journey, Care Plan, Messages, and More. Mobile uses React Native and shares compatible tokens, types, validation, and fixtures with the browser. State stays in memory until reload; no API connection is required.

## Run the API

```sh
npm run dev:api
```

The API listens at [the loopback health endpoint](http://127.0.0.1:4000/health). Defaults are `APP_MODE=demo`, `API_HOST=127.0.0.1`, and `API_PORT=4000`. It rejects non-demo mode or a non-loopback listen host. Configuration uses process environment variables; `.env.example` files document them and do not configure production services.

```sh
curl http://127.0.0.1:4000/health
curl -H 'X-Demo-User: user-demo-patient' \
  http://127.0.0.1:4000/v1/organizations/org-demo/patients/patient-demo-avery/sessions
```

`X-Demo-User` selects a public synthetic identity. It is not a credential or secure sign-in. API state and audit events reset on server restart. The typed client is ready for explicit integration; browser/mobile fixture actions do not call this API.

## Validate

```sh
npm run typecheck
npm run lint
npm test
npm run build:web
npm run build:api
npm run check:mobile
npx playwright install chromium
npm run test:e2e
```

Browser tests start a local Next.js server when needed. Close an unrelated service on port 3000 before running them. `check:mobile` checks native types and exports the Expo bundle; it does not replace running on iPhone and Android. `npm run build` runs coordinated workspace builds. `npm run format` applies formatting; `npm run format:check` checks it.

Read [testing and verification](docs/testing.md) for scope, actual results, and device/environment checks still required.

## Workspace

| Path                     | Purpose                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| `apps/web`               | Next.js App Router workspaces and responsive UI                   |
| `apps/mobile`            | Expo Router app with role-specific native navigation              |
| `apps/api`               | Fastify demo API with server authorization and audit interface    |
| `packages/ui`            | Browser primitives; native equivalents live in the mobile app     |
| `packages/types`         | Domain contracts and separate public synthetic fixtures           |
| `packages/schemas`       | Shared strict Zod input validation                                |
| `packages/api-client`    | Typed API client and separate fixture service                     |
| `packages/design-tokens` | Brand colors, typography, spacing, and sizes                      |
| `packages/auth`          | Authentication interface and patient/tenant authorization         |
| `packages/config`        | Shared TypeScript configuration                                   |
| `infrastructure`         | Review-only PostgreSQL migration and deployment boundary          |
| `docs`                   | Architecture, security, routes, testing, and Phase 2 requirements |

Frontend navigation is a convenience, not a security boundary. The API checks active practice membership, roles, patient identity/assignment, sharing status, and psychotherapy authorship. Clinical progress notes, separately maintained psychotherapy notes, clinician-approved patient updates, and patient-private journals have distinct domain types and access rules.

The SQL migration is a foundation for a future PostgreSQL/Supabase adapter. It is not applied automatically or connected to the API. It needs a development database, exact-role RLS tests, write policies, repository adapters, operational controls, and review before real use. No production migration or deployment is performed.

## Documentation

- [Architecture and API contracts](docs/architecture.md)
- [Security model and limits](docs/security.md)
- [Route inventory](docs/routes.md)
- [Testing and results](docs/testing.md)
- [Phase 2 requirements](docs/phase-2.md)
- [Database/deployment foundation](infrastructure/README.md)

Implementation references: [Next.js installation and App Router setup](https://nextjs.org/docs/app/getting-started/installation) and [Expo monorepo guidance](https://docs.expo.dev/guides/monorepos/).
