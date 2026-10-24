# Patient Touch mobile

One Expo Router application with distinct therapist and patient navigation. Start in the therapist demo; open **More → Explore the demo → Patient** to switch. All identities and records are invented. Authentication screens are previews, and no login, email, video call, recording, AI request, or payment is performed.

From the repository root:

```sh
npm install
npm run dev:mobile
```

The Expo terminal offers Android, iOS simulator, and browser launch options. Running on a simulator or physical device requires the matching native tooling and an Expo client or development build compatible with SDK 57. No native project or app-store identifiers are provisioned in Phase 1.

Independent mobile commands:

```sh
npm run typecheck --workspace=@patient-touch/mobile
npm run export --workspace=@patient-touch/mobile
npm run export:web --workspace=@patient-touch/mobile
```

The export command bundles Android, iOS, and static browser routes. A successful bundle does not verify device behavior, native signing, VoiceOver/TalkBack, or app-store submission.

Therapists have Today, Calendar, Patients, Messages, and More. Patients have Home, My Journey, Care Plan, Messages, and More. Details use the native stack. Search, sample filters, resource checkmarks, message composition, and patient journal entry work in local memory and reset on reload. Shared types, fixture data, design tokens, and Zod validation come from the monorepo packages. No production endpoint is configured.
