# Route inventory

Routes are local synthetic previews. Browser navigation does not authenticate or authorize a person. Production access must be enforced by the API and database. Browser smoke checks cover the route inventory; workflow tests exercise representative interactions.

## Browser therapist workspace

| Route                            | Screen                                            |
| -------------------------------- | ------------------------------------------------- |
| `/therapist/today`               | Today dashboard                                   |
| `/therapist/calendar`            | Day/agenda scheduling and local appointment modal |
| `/therapist/patients`            | Searchable synthetic caseload                     |
| `/therapist/patients/[id]`       | Patient profile                                   |
| `/therapist/journey`             | Searchable patient journey                        |
| `/therapist/sessions`            | Session library                                   |
| `/therapist/sessions/[id]`       | Session detail                                    |
| `/therapist/telehealth`          | Disabled telehealth/recording workspace           |
| `/therapist/notes`               | Clinical progress notes                           |
| `/therapist/psychotherapy-notes` | Separate psychotherapy note concept               |
| `/therapist/updates`             | Clinician-approved patient updates                |
| `/therapist/treatment-plans`     | Plans and goals                                   |
| `/therapist/messages`            | Local undelivered message preview                 |
| `/therapist/resources`           | Resource/exercise previews                        |
| `/therapist/forms`               | Intake/forms shell                                |
| `/therapist/billing`             | Sample billing/payment metadata                   |
| `/therapist/insurance`           | Unconnected insurance/claims shell                |
| `/therapist/reports`             | Synthetic analytics shell                         |
| `/therapist/team`                | Roles and membership concepts                     |
| `/therapist/consent`             | Consent and privacy concepts                      |
| `/therapist/settings`            | Practice settings shell                           |
| `/therapist/data`                | Unconnected import/export shell                   |
| `/therapist/notifications`       | Sample notifications                              |
| `/therapist/onboarding`          | Practice onboarding shell                         |

## Browser patient workspace

| Route                           | Screen                                  |
| ------------------------------- | --------------------------------------- |
| `/patient/home`                 | Next appointment and next useful action |
| `/patient/appointments`         | Patient schedule                        |
| `/patient/journey`              | My Journey                              |
| `/patient/sessions`             | Shared session library                  |
| `/patient/sessions/[id]`        | Shared session detail                   |
| `/patient/sessions/[id]/replay` | Disabled replay/transcript shell        |
| `/patient/bookmarks`            | Bookmark concept; no recordings exist   |
| `/patient/care-plan`            | Shared care goals                       |
| `/patient/journal`              | In-memory private reflection form       |
| `/patient/resources`            | Shared resource previews                |
| `/patient/messages`             | Local undelivered message preview       |
| `/patient/forms`                | Intake/consent shell                    |
| `/patient/billing`              | Sample billing/receipts                 |
| `/patient/notifications`        | Sample care notifications               |
| `/patient/settings`             | Privacy/account shell                   |
| `/patient/records`              | Reviewed records-request concept        |
| `/patient/help`                 | Help and emergency guidance             |

## Authentication interfaces

No provider is configured: no account is created, password verified, or email delivered.

| Route              | Interface                |
| ------------------ | ------------------------ |
| `/login`           | Login and demo entry     |
| `/register`        | Account creation preview |
| `/forgot-password` | Password reset preview   |
| `/recover-account` | Account recovery preview |
| `/onboarding`      | Practice setup entry     |

Synthetic profile IDs are `patient-demo-avery`, `patient-demo-jamie`, `patient-demo-riley`, and `patient-demo-quinn`. Session IDs are `session-demo-1`, `session-demo-2`, and `session-demo-3`; only the first two are portal-shared. These fixture identifiers are not production database seeds. Unknown IDs must show an unavailable/not-found state.

## Expo Router

The mobile app uses one tab route group. **More → Explore the demo** switches the presentation role.

| File route                           | Therapist label | Patient label |
| ------------------------------------ | --------------- | ------------- |
| `/(tabs)/index` (URL `/`)            | Today           | Home          |
| `/(tabs)/activity` (URL `/activity`) | Calendar        | My Journey    |
| `/(tabs)/care` (URL `/care`)         | Patients        | Care Plan     |
| `/(tabs)/messages` (URL `/messages`) | Messages        | Messages      |
| `/(tabs)/more` (URL `/more`)         | More            | More          |

Detail routes are `/patient/[id]`, `/session/[id]`, `/journal`, `/auth/[mode]`, and `/feature/[slug]`; `+not-found` provides fallback. Auth modes are `login`, `register`, `reset`, and `recovery`.

Feature slugs cover `appointment`, `appointments`, `sessions`, `journey`, `clinical-notes`, `psychotherapy-notes`, `patient-updates`, `treatment-plans`, `resources`, `forms`, `billing`, `insurance`, `reports`, `team`, `privacy`, `settings`, `data`, `notifications`, `telehealth`, `bookmarks`, `records`, `support`, and `replay`. Role-specific previews limit visible surfaces. These presentation restrictions do not replace server authorization.
