-- REVIEW-ONLY foundation. Apply only to a newly provisioned local/development database.
-- No production connection or automated migration runner is configured.
BEGIN;
CREATE SCHEMA IF NOT EXISTS app;
REVOKE ALL ON SCHEMA app FROM PUBLIC;

CREATE TYPE public.membership_role AS ENUM ('owner', 'administrator', 'clinician', 'billing', 'patient');
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text UNIQUE NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  roles public.membership_role[] NOT NULL CHECK (cardinality(roles) > 0),
  status text NOT NULL CHECK (status IN ('active', 'invited', 'suspended')),
  UNIQUE (organization_id, user_id), UNIQUE (organization_id, id)
);
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid,
  display_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'paused', 'discharged')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id), UNIQUE (organization_id, user_id),
  FOREIGN KEY (organization_id, user_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.patient_clinician_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  clinician_id uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, patient_id, clinician_id),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, clinician_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  clinician_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  status text NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  modality text NOT NULL CHECK (modality IN ('telehealth', 'in_person')),
  UNIQUE (organization_id, patient_id, id),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, clinician_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  clinician_id uuid NOT NULL,
  appointment_id uuid,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  portal_shared boolean NOT NULL DEFAULT false,
  recording_enabled boolean NOT NULL DEFAULT false CHECK (recording_enabled = false),
  UNIQUE (organization_id, patient_id, id),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, clinician_id) REFERENCES public.organization_memberships(organization_id, user_id),
  FOREIGN KEY (organization_id, patient_id, appointment_id) REFERENCES public.appointments(organization_id, patient_id, id)
);
CREATE TABLE public.clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  session_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'signed', 'amended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, patient_id, session_id) REFERENCES public.sessions(organization_id, patient_id, id),
  FOREIGN KEY (organization_id, author_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
-- Separate table, separate policy. No patient portal or administrator fallback.
CREATE TABLE public.psychotherapy_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  session_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, patient_id, session_id) REFERENCES public.sessions(organization_id, patient_id, id),
  FOREIGN KEY (organization_id, author_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.patient_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  session_id uuid NOT NULL,
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  approved_at timestamptz,
  FOREIGN KEY (organization_id, patient_id, session_id) REFERENCES public.sessions(organization_id, patient_id, id),
  FOREIGN KEY (organization_id, author_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.patient_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, author_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  clinician_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  portal_shared boolean NOT NULL DEFAULT false,
  UNIQUE (organization_id, patient_id, id),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, clinician_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  treatment_plan_id uuid NOT NULL,
  title text NOT NULL,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  portal_shared boolean NOT NULL DEFAULT false,
  FOREIGN KEY (organization_id, patient_id, treatment_plan_id) REFERENCES public.treatment_plans(organization_id, patient_id, id)
);
CREATE TABLE public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('treatment', 'telehealth', 'recording', 'portal_sharing')),
  status text NOT NULL CHECK (status IN ('pending', 'granted', 'declined', 'withdrawn')),
  policy_version text NOT NULL,
  recorded_at timestamptz,
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id)
);
CREATE TABLE public.resource_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('assigned', 'completed')),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, assigned_by) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 4000),
  sent_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, sender_id) REFERENCES public.organization_memberships(organization_id, user_id),
  FOREIGN KEY (organization_id, recipient_id) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.records_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('clinical_record', 'session_materials', 'other')),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'fulfilled', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, patient_id) REFERENCES public.patients(organization_id, id),
  FOREIGN KEY (organization_id, requested_by) REFERENCES public.organization_memberships(organization_id, user_id)
);
CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  actor_id uuid NOT NULL REFERENCES public.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  outcome text NOT NULL CHECK (outcome IN ('allowed', 'denied')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  request_id text NOT NULL
);

-- Verified JWT subject from Supabase/PostgREST, or a transaction-local actor set
-- by a trusted API after authentication. Never expose a database connection to clients.
CREATE FUNCTION app.actor_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT id FROM public.users
  WHERE auth_subject = COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', NULLIF(current_setting('app.auth_subject', true), ''))
$$;
-- SECURITY DEFINER helpers read memberships/assignments without recursive RLS.
-- Owner must be a non-login migration owner, never the runtime connection role.
CREATE FUNCTION app.has_role(org uuid, allowed public.membership_role[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_memberships m WHERE m.organization_id = org AND m.user_id = app.actor_id() AND m.status = 'active' AND m.roles && allowed)
$$;
CREATE FUNCTION app.is_member(org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_memberships m WHERE m.organization_id = org AND m.user_id = app.actor_id() AND m.status = 'active')
$$;
CREATE FUNCTION app.is_clinician_for(org uuid, patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT app.has_role(org, ARRAY['clinician']::public.membership_role[]) AND EXISTS (
    SELECT 1 FROM public.patient_clinician_assignments a WHERE a.organization_id = org AND a.patient_id = patient AND a.clinician_id = app.actor_id() AND a.active
  )
$$;
CREATE FUNCTION app.is_patient(org uuid, patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT app.has_role(org, ARRAY['patient']::public.membership_role[]) AND EXISTS (
    SELECT 1 FROM public.patients p WHERE p.organization_id = org AND p.id = patient AND p.user_id = app.actor_id()
  )
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app FROM PUBLIC;

-- No application grants are installed. Grant narrowly to a separately created
-- non-owner, non-superuser, NOBYPASSRLS runtime role after provider integration.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_clinician_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychotherapy_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
-- Helpers intentionally bypass RLS on users/memberships/assignments using the
-- migration owner's ownership. FORCE applies to patient data, never helper tables.
ALTER TABLE public.patients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.psychotherapy_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.patient_updates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.patient_journal_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE public.goals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.consents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.records_access_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

CREATE POLICY users_self ON public.users FOR SELECT USING (auth_subject = COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', NULLIF(current_setting('app.auth_subject', true), '')));
CREATE POLICY organizations_member ON public.organizations FOR SELECT USING (app.is_member(id));
CREATE POLICY memberships_self ON public.organization_memberships FOR SELECT USING (user_id = app.actor_id());
CREATE POLICY assignments_read ON public.patient_clinician_assignments FOR SELECT USING (app.is_member(organization_id) AND (clinician_id = app.actor_id() OR app.has_role(organization_id, ARRAY['owner', 'administrator']::public.membership_role[])));
CREATE POLICY patients_read ON public.patients FOR SELECT USING (
  app.is_member(organization_id) AND (
    (user_id = app.actor_id() AND app.has_role(organization_id, ARRAY['patient']::public.membership_role[]))
    OR app.is_clinician_for(organization_id, id)
    OR app.has_role(organization_id, ARRAY['owner', 'administrator']::public.membership_role[])
  )
);
CREATE POLICY appointments_read ON public.appointments FOR SELECT USING (app.is_patient(organization_id, patient_id) OR app.is_clinician_for(organization_id, patient_id) OR app.has_role(organization_id, ARRAY['owner', 'administrator']::public.membership_role[]));
CREATE POLICY sessions_read ON public.sessions FOR SELECT USING (app.is_clinician_for(organization_id, patient_id) OR (portal_shared AND app.is_patient(organization_id, patient_id)));
CREATE POLICY clinical_notes_read ON public.clinical_notes FOR SELECT USING (app.is_clinician_for(organization_id, patient_id));
CREATE POLICY psychotherapy_notes_author ON public.psychotherapy_notes FOR SELECT USING (author_id = app.actor_id() AND app.is_clinician_for(organization_id, patient_id));
CREATE POLICY patient_updates_read ON public.patient_updates FOR SELECT USING (app.is_clinician_for(organization_id, patient_id) OR (approved_at IS NOT NULL AND app.is_patient(organization_id, patient_id)));
CREATE POLICY journals_private ON public.patient_journal_entries FOR SELECT USING (author_id = app.actor_id() AND app.is_patient(organization_id, patient_id));
CREATE POLICY treatment_plans_read ON public.treatment_plans FOR SELECT USING (app.is_clinician_for(organization_id, patient_id) OR (portal_shared AND app.is_patient(organization_id, patient_id)));
CREATE POLICY goals_read ON public.goals FOR SELECT USING (app.is_clinician_for(organization_id, patient_id) OR (portal_shared AND app.is_patient(organization_id, patient_id)));
CREATE POLICY consents_read ON public.consents FOR SELECT USING (app.is_clinician_for(organization_id, patient_id) OR app.is_patient(organization_id, patient_id));
CREATE POLICY resources_read ON public.resource_assignments FOR SELECT USING (app.is_clinician_for(organization_id, patient_id) OR app.is_patient(organization_id, patient_id));
CREATE POLICY messages_participants ON public.messages FOR SELECT USING ((sender_id = app.actor_id() OR recipient_id = app.actor_id()) AND (app.is_clinician_for(organization_id, patient_id) OR app.is_patient(organization_id, patient_id)));
CREATE POLICY records_request_self ON public.records_access_requests FOR SELECT USING (requested_by = app.actor_id() AND app.is_patient(organization_id, patient_id));
-- No audit SELECT/UPDATE/DELETE policy. A separate append-only logging principal
-- and retention/export policy must be designed before any real data is accepted.
-- No mutation policies in Phase 1. Missing policies deny access by default.

CREATE INDEX appointments_patient_time ON public.appointments(organization_id, patient_id, starts_at);
CREATE INDEX sessions_patient_time ON public.sessions(organization_id, patient_id, starts_at);
CREATE INDEX assignments_clinician ON public.patient_clinician_assignments(organization_id, clinician_id) WHERE active;
CREATE INDEX messages_patient_time ON public.messages(organization_id, patient_id, sent_at);
CREATE INDEX audit_organization_time ON public.audit_events(organization_id, occurred_at);
COMMIT;
