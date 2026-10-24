'use client';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  Tabs,
  Modal,
  ConfirmationDialog,
  EmptyState,
  SearchBar,
  Table,
} from '@patient-touch/ui';
import {
  messageSchema,
  journalEntrySchema,
  appointmentSchema,
  recordsAccessRequestSchema,
} from '@patient-touch/schemas';
import {
  demoPatients,
  demoAppointments,
  demoSessions,
  demoJourney,
  demoGoals,
  demoResources,
  demoMessages,
  demoPatientUpdates,
  demoInvoices,
  demoForms,
  demoConsents,
  demoUsers,
  demoMemberships,
} from '@patient-touch/types/demo';
import type { Appointment } from '@patient-touch/types';
import { therapistRoutes, patientRoutes, getRoute } from '../lib/routes';
import { Brand, Icon } from './icon';

type Mode = 'therapist' | 'patient';
const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  }).format(new Date(value));
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  }).format(new Date(value));
const patientName = (id: string) =>
  demoPatients.find((p) => p.id === id)?.displayName || 'Demo patient';
function Avatar({
  initials,
  large = false,
  color = 0,
}: {
  initials: string;
  large?: boolean;
  color?: number;
}) {
  return (
    <span className={`avatar avatar-${color % 4} ${large ? 'avatar-large' : ''}`}>{initials}</span>
  );
}
function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
function SmallLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}
function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <div className="inline-note">
      <Icon name="sparkles" size={16} />
      <span>{children || 'Synthetic preview · Changes stay in this page until you refresh.'}</span>
    </div>
  );
}

export function Workspace({ role, slug }: { role: Mode; slug: string }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const [account, setAccount] = useState(false);
  const [appointment, setAppointment] = useState(false);
  const [appointments, setAppointments] = useState(demoAppointments);
  const [notice, setNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const router = useRouter();
  const patient = role === 'patient';
  const routes = patient ? patientRoutes : therapistRoutes;
  const route = getRoute(role, slug) || {
    title: slug.startsWith('patients/')
      ? 'Patient profile'
      : slug.endsWith('/replay')
        ? 'Session replay'
        : 'Session detail',
    description: 'Thoughtfully connected care.',
  };
  function notify(message: string) {
    setNotice(message);
  }
  const extras = routes.filter((r) => r.group !== 'main');
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="nav-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <Link
          href={`/${role}/${patient ? 'home' : 'today'}`}
          className="brand-link"
          aria-label="Patient Touch home"
        >
          <Brand />
        </Link>
        <button className="practice-switch" onClick={() => setAccount(true)}>
          <span className="practice-monogram">W</span>
          <span>
            <strong>Willow Therapy</strong>
            <small>{patient ? 'Your care space' : 'Your practice workspace'}</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">{patient ? 'YOUR SPACE' : 'WORKSPACE'}</div>
        <nav className="main-nav">
          {routes
            .filter((r) => r.group === 'main')
            .map((item) => (
              <Link
                onClick={() => setMobileNav(false)}
                key={item.slug}
                href={`/${role}/${item.slug}`}
                aria-current={slug.split('/')[0] === item.slug ? 'page' : undefined}
              >
                <Icon name={item.icon} />
                <span>{item.title}</span>
                {item.slug === 'messages' && <span className="nav-count">1</span>}
              </Link>
            ))}
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className={`nav-more ${extras.some((item) => item.slug === slug) ? 'is-active' : ''}`}
          >
            <Icon name={patient ? 'settings' : 'forms'} />
            <span>{patient ? 'Account & more' : 'Practice & clinical'}</span>
            <ChevronDown size={14} className={expanded ? 'rotated' : ''} />
          </button>
          {expanded && (
            <div className="extra-nav">
              {extras.map((item) => (
                <Link
                  key={item.slug}
                  onClick={() => setMobileNav(false)}
                  href={`/${role}/${item.slug}`}
                  aria-current={slug === item.slug ? 'page' : undefined}
                >
                  <Icon size={16} name={item.icon} />
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promise">
            <span className="small-plant" aria-hidden="true">
              ✦
            </span>
            <strong>Care beyond the session.</strong>
            <p>
              More connection.
              <br />
              More room to grow.
            </p>
          </div>
          <Link href={`/${role}/${patient ? 'help' : 'settings'}`} className="sidebar-help">
            <Icon name={patient ? 'help' : 'settings'} />
            {patient ? 'Help & support' : 'Settings'}
          </Link>
          <button className="account-switch" onClick={() => setAccount(true)}>
            <Avatar initials={patient ? 'AM' : 'MC'} />
            <span>
              <strong>{patient ? 'Avery Morgan' : 'Maya Chen'}</strong>
              <small>{patient ? 'Patient portal' : 'Therapist · Demo'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      <div className="workspace-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <span className="workspace-crumb">{patient ? 'My care' : 'My workspace'}</span>
            <ChevronRight size={14} />
            <span>{route.title}</span>
          </div>
          <div className="topbar-right">
            <div className="global-search">
              <Search size={17} />
              <input
                aria-label="Search the workspace"
                placeholder={
                  patient ? 'Find something in your care…' : 'Search patients, sessions, and more…'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>
            <Link
              href={`/${role}/notifications`}
              className="icon-button notification-button"
              aria-label="Notifications, 1 unread"
            >
              <Icon name="bell" size={21} />
              <span />
            </Link>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              onClick={() => setAccount(true)}
              aria-label="Account and demo role"
            >
              <Avatar initials={patient ? 'AM' : 'MC'} />
            </button>
          </div>
        </header>
        <div className="demo-banner">
          <span className="demo-dot" />
          <strong>Demo workspace</strong>
          <span>All people and records are synthetic. Please use sample information only.</span>
          <button onClick={() => router.push(patient ? '/therapist/today' : '/patient/home')}>
            {patient ? 'Explore therapist view' : 'Explore patient view'}
            <ArrowRight size={13} />
          </button>
        </div>
        <main id="main-content" tabIndex={-1} className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {slug === 'today'
                  ? 'MONDAY, OCTOBER 26 · SAMPLE DAY'
                  : patient
                    ? 'YOUR CARE, CONNECTED'
                    : 'WILLOW THERAPY'}
              </div>
              <h1>
                {slug === 'today'
                  ? 'Good morning, Maya'
                  : slug === 'home'
                    ? 'Welcome back, Avery'
                    : route.title}
                {(slug === 'today' || slug === 'home') && <span className="greeting-dot">.</span>}
              </h1>
              <p>{route.description}</p>
            </div>
            {!patient && ['today', 'calendar'].includes(slug) ? (
              <Button onClick={() => setAppointment(true)}>
                <Plus size={17} />
                New appointment
              </Button>
            ) : slug === 'patients' ? (
              <Button
                variant="secondary"
                onClick={() =>
                  notify(
                    'Patient invitations will be available after production authentication is connected.',
                  )
                }
              >
                <Plus size={17} />
                Invite patient
              </Button>
            ) : null}
          </div>
          {slug === 'today' ? (
            <TherapistToday appointments={appointments} />
          ) : slug === 'home' ? (
            <PatientHome />
          ) : slug === 'calendar' || slug === 'appointments' ? (
            <CalendarView
              role={role}
              appointments={appointments}
              add={() => setAppointment(true)}
            />
          ) : slug === 'patients' ? (
            <Patients />
          ) : slug.startsWith('patients/') ? (
            <PatientProfile patientId={slug.split('/')[1]} />
          ) : slug === 'journey' ? (
            <Journey role={role} />
          ) : slug === 'sessions' ? (
            <Sessions role={role} />
          ) : slug.startsWith('sessions/') ? (
            <SessionDetail
              role={role}
              sessionId={slug.split('/')[1]}
              replay={slug.endsWith('/replay')}
              notify={notify}
            />
          ) : slug === 'messages' ? (
            <Messages role={role} />
          ) : slug === 'care-plan' || slug === 'treatment-plans' ? (
            <CarePlan />
          ) : slug === 'resources' ? (
            <Resources role={role} notify={notify} />
          ) : slug === 'journal' ? (
            <Journal />
          ) : slug === 'telehealth' ? (
            <Telehealth />
          ) : (
            <AdditionalPage role={role} slug={slug} notify={notify} />
          )}
          <footer className="workspace-footer">
            <span>
              <Brand compact /> Thoughtful care. Lasting connection.
            </span>
            <span>Patient Touch · Phase 1 preview</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon name="sparkles" size={18} />
          <span>{notice}</span>
          <button
            className="icon-button"
            onClick={() => setNotice('')}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <Modal title="Find your way" open={!!search.trim()} onClose={() => setSearch('')}>
        <div className="search-results">
          {routes
            .filter((item) =>
              `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item) => (
              <Link onClick={() => setSearch('')} key={item.slug} href={`/${role}/${item.slug}`}>
                <Icon name={item.icon} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          {!routes.some((item) =>
            `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
          ) && (
            <EmptyState
              title="No matching pages"
              description="Try calendar, messages, sessions, or resources."
            />
          )}
        </div>
      </Modal>
      <Modal title="Your demo workspace" open={account} onClose={() => setAccount(false)}>
        <DemoNote>These views use synthetic identities. No secure sign-in is configured.</DemoNote>
        <p>
          Willow Therapy is the sample practice. The foundation supports users with multiple
          practice memberships and roles.
        </p>
        <div className="account-options">
          <Link href="/therapist/today" onClick={() => setAccount(false)}>
            <Avatar initials="MC" />
            <span>
              <strong>Maya Chen</strong>
              <small>Therapist workspace</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/patient/home" onClick={() => setAccount(false)}>
            <Avatar initials="AM" color={1} />
            <span>
              <strong>Avery Morgan</strong>
              <small>Patient portal</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/therapist/team" onClick={() => setAccount(false)}>
            <Icon name="users" />
            <span>
              <strong>Practice roles</strong>
              <small>Owner, administrator, clinician, billing, patient</small>
            </span>
          </Link>
        </div>
        <div className="pt-dialog-actions">
          <Button
            variant="ghost"
            onClick={() => {
              setAccount(false);
              setConfirmReset(true);
            }}
          >
            Reset demo
          </Button>
          <Link href="/login" className="text-link">
            <LogOut size={16} />
            Back to sign in
          </Link>
        </div>
      </Modal>
      <ConfirmationDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset this demo?"
        description="This will clear unsaved changes in the current page and reload the synthetic examples."
        confirmLabel="Reset demo"
        onConfirm={() => window.location.reload()}
      />
      <AppointmentModal
        open={appointment}
        onClose={() => setAppointment(false)}
        onAdd={(item) => {
          setAppointments((previous) => [...previous, item]);
          setAppointment(false);
          notify('Sample appointment added to this page. It resets on refresh.');
        }}
      />
    </div>
  );
}

function TherapistToday({ appointments }: { appointments: Appointment[] }) {
  const [tasks, setTasks] = useState([false, false, true]);
  return (
    <>
      <div className="stat-grid">
        {[
          {
            label: 'Sessions today',
            value: String(appointments.length).padStart(2, '0'),
            icon: 'calendar',
            detail: 'A day of meaningful connections',
            color: 'teal',
          },
          {
            label: 'Active patients',
            value: '03',
            icon: 'users',
            detail: 'In your sample caseload',
            color: 'green',
          },
          {
            label: 'Notes to complete',
            value: '02',
            icon: 'notes',
            detail: 'A little time to reflect',
            color: 'amber',
          },
          {
            label: 'Unread messages',
            value: '01',
            icon: 'message',
            detail: 'Stay connected between sessions',
            color: 'purple',
          },
        ].map((stat) => (
          <Card key={stat.label} className="stat-card">
            <div className="stat-top">
              <span>{stat.label}</span>
              <span className={`stat-icon stat-icon-${stat.color}`}>
                <Icon name={stat.icon} size={19} />
              </span>
            </div>
            <strong className="stat-value">{stat.value}</strong>
            <p>{stat.detail}</p>
          </Card>
        ))}
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <Card className="schedule-card">
            <SectionHeading title="Your day, at a glance">
              <SmallLink href="/therapist/calendar">View calendar</SmallLink>
            </SectionHeading>
            <div className="schedule-date">
              <span>
                <Icon name="calendar" size={17} />
                Monday, October 26
              </span>
              <Badge tone="teal">{appointments.length} sessions</Badge>
            </div>
            <div className="schedule-list">
              {[...appointments]
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                .map((item, i) => (
                  <div className="schedule-row" key={item.id}>
                    <div className="appointment-time">
                      <strong>{formatTime(item.startsAt).split(' ')[0]}</strong>
                      <span>{formatTime(item.startsAt).split(' ')[1]}</span>
                    </div>
                    <span className={`schedule-line line-${i % 3}`} />
                    <Avatar
                      initials={patientName(item.patientId)
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                      color={i}
                    />
                    <div className="appointment-person">
                      <Link href={`/therapist/patients/${item.patientId}`}>
                        <strong>{patientName(item.patientId)}</strong>
                      </Link>
                      <span>{item.title} · 50 min</span>
                    </div>
                    <span className="appointment-modality">
                      <Icon name={item.modality === 'telehealth' ? 'video' : 'users'} size={15} />
                      {item.modality === 'telehealth' ? 'Telehealth' : 'In person'}
                    </span>
                    <Badge tone={item.status === 'confirmed' ? 'green' : 'neutral'}>
                      {item.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                    </Badge>
                    <Link
                      className="icon-button"
                      aria-label={`Open appointment for ${patientName(item.patientId)}`}
                      href="/therapist/telehealth"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                ))}
            </div>
            <div className="schedule-bottom">
              <span className="status-dot" />A little breathing room between sessions.
            </div>
          </Card>
          <Card className="journey-preview">
            <SectionHeading title="Care that keeps moving">
              <SmallLink href="/therapist/journey">View journey</SmallLink>
            </SectionHeading>
            <div className="journey-preview-person">
              <Avatar initials="AM" color={1} />
              <div>
                <strong>Avery Morgan</strong>
                <span>A small step, worth noticing</span>
              </div>
              <Badge tone="green">Patient journey</Badge>
            </div>
            <div className="journey-mini">
              <div className="mini-timeline-icon">
                <Icon name="target" size={18} />
              </div>
              <div>
                <strong>Making space for what matters</strong>
                <p>Avery is working toward a weekly boundary practice.</p>
                <div className="progress-with-label">
                  <span className="progress-bar">
                    <i style={{ width: '65%' }} />
                  </span>
                  <span>65%</span>
                </div>
              </div>
              <Link
                href="/therapist/treatment-plans"
                className="icon-button"
                aria-label="View treatment goals"
              >
                <ArrowRight size={19} />
              </Link>
            </div>
          </Card>
        </div>
        <div className="dashboard-aside">
          <div className="connection-card">
            <div className="botanical" aria-hidden="true">
              <svg viewBox="0 0 180 160" fill="none">
                <circle cx="113" cy="70" r="60" fill="#d8ebe3" />
                <path
                  d="M100 151c-5-45 3-83 34-121M106 110C66 107 49 80 58 58c30 2 51 22 48 52ZM111 85c29 0 49-17 45-39-25-1-44 17-45 39ZM101 134c-36 7-58-12-64-32 27-11 52 6 64 32"
                  stroke="#6a9e8a"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <span className="eyebrow">THE SPACE BETWEEN</span>
            <h2>
              Small moments.
              <br />
              Lasting progress.
            </h2>
            <p>Help your patients carry the work beyond the therapy room.</p>
            <Link href="/therapist/resources" className="text-link">
              Explore resources
              <ArrowRight size={16} />
            </Link>
          </div>
          <Card className="tasks-card">
            <SectionHeading title="A little to-do">
              <span className="count-label">{tasks.filter((t) => !t).length} left</span>
            </SectionHeading>
            {[
              'Review Avery’s progress note',
              'Prepare for Jamie’s session',
              'Share grounding resource',
            ].map((task, i) => (
              <label className={`task-item ${tasks[i] ? 'task-done' : ''}`} key={task}>
                <input
                  type="checkbox"
                  checked={tasks[i]}
                  onChange={() => setTasks(tasks.map((v, j) => (j === i ? !v : v)))}
                />
                <span>
                  {task}
                  <small>
                    {i === 0
                      ? 'Clinical documentation'
                      : i === 1
                        ? 'Today · 10:00 AM'
                        : 'Completed in sample data'}
                  </small>
                </span>
              </label>
            ))}
            <div className="card-footnote">Your checklist resets on refresh.</div>
          </Card>
          <Card className="message-preview">
            <div className="message-preview-icon">
              <Icon name="message" size={21} />
            </div>
            <div>
              <strong>A conversation is waiting</strong>
              <p>1 unread sample message</p>
              <SmallLink href="/therapist/messages">Open messages</SmallLink>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
function PatientHome() {
  return (
    <>
      <div className="patient-hero">
        <div>
          <span className="eyebrow">YOUR NEXT SESSION</span>
          <h2>A little time, just for you.</h2>
          <p>Monday, October 26 · 4:00 PM · 50 minutes</p>
          <div className="hero-clinician">
            <Avatar initials="MC" />
            <span>
              Maya Chen<span>Individual therapy · Telehealth</span>
            </span>
          </div>
          <Link href="/patient/appointments" className="pt-button pt-button--primary">
            View appointment
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-leaf" aria-hidden="true">
          <svg viewBox="0 0 220 240" fill="none">
            <circle cx="110" cy="115" r="96" fill="#dbece4" />
            <path
              d="M105 222c-18-63-7-116 42-177M105 148C56 144 33 100 51 68c38 7 65 35 54 80ZM111 116c47-2 70-30 61-58-37 1-61 25-61 58ZM100 190c-47 10-78-17-80-43 37-8 68 13 80 43Z"
              stroke="#75a38b"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="patient-card-grid">
        <Card className="padded-card">
          <span className="feature-icon">
            <Icon name="notes" />
          </span>
          <h2>How are you arriving today?</h2>
          <p>A thought, a feeling, a small moment. There’s room for all of it.</p>
          <SmallLink href="/patient/journal">Take a moment to reflect</SmallLink>
        </Card>
        <Card className="padded-card">
          <span className="feature-icon blue">
            <Icon name="book" />
          </span>
          <h2>A little grounding</h2>
          <p>Maya shared a five-minute exercise to help you find your feet.</p>
          <SmallLink href="/patient/resources">Try your shared resource</SmallLink>
        </Card>
        <Card className="padded-card">
          <span className="feature-icon sand">
            <Icon name="target" />
          </span>
          <h2>Your direction, your pace</h2>
          <p>Three small goals. Every step counts, including the quiet ones.</p>
          <SmallLink href="/patient/care-plan">Explore your care plan</SmallLink>
        </Card>
      </div>
      <Card className="update-card">
        <SectionHeading title="From your last conversation">
          <SmallLink href="/patient/sessions/session-demo-1">Revisit session</SmallLink>
        </SectionHeading>
        <div className="update-content">
          <Avatar initials="MC" />
          <div>
            <span className="eyebrow">A TAKEAWAY FROM MAYA · OCT 19</span>
            <h3>{demoPatientUpdates[0].title}</h3>
            <p>{demoPatientUpdates[0].content}</p>
            <Badge tone="green">Sample clinician-approved update</Badge>
          </div>
        </div>
      </Card>
    </>
  );
}

function CalendarView({
  role,
  appointments,
  add,
}: {
  role: Mode;
  appointments: Appointment[];
  add: () => void;
}) {
  const [view, setView] = useState('Day');
  const [offset, setOffset] = useState(0);
  const selectedDay = 26 + offset;
  const items = (
    role === 'patient'
      ? appointments.filter((a) => a.patientId === 'patient-demo-avery')
      : appointments
  ).filter((a) => new Date(a.startsAt).getUTCDate() === selectedDay);
  return (
    <>
      <div className="page-toolbar">
        <div className="calendar-control">
          <Button
            variant="secondary"
            aria-label="Previous day"
            onClick={() => setOffset(offset - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <strong>
            {formatDate(new Date(Date.UTC(2026, 9, selectedDay, 19)).toISOString())}, 2026
          </strong>
          <Button variant="secondary" aria-label="Next day" onClick={() => setOffset(offset + 1)}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="ghost" onClick={() => setOffset(0)}>
            Sample day
          </Button>
        </div>
        <Tabs items={['Day', 'Agenda']} value={view} onChange={setView} />
      </div>
      <Card className="calendar-card">
        <div className="calendar-heading">
          <span>Pacific Time (Los Angeles)</span>
          <Badge tone="teal">
            {items.length} {items.length === 1 ? 'appointment' : 'appointments'}
          </Badge>
        </div>
        {!items.length ? (
          <EmptyState
            title="A little open space"
            description="No sample appointments on this day. Return to October 26 to explore the sample schedule."
          />
        ) : view === 'Agenda' ? (
          items.map((a) => (
            <div className="agenda-row" key={a.id}>
              <Icon name="calendar" />
              <div>
                <strong>
                  {role === 'patient' ? 'Session with Maya Chen' : patientName(a.patientId)}
                </strong>
                <p>
                  {formatTime(a.startsAt)} – {formatTime(a.endsAt)} · {a.title}
                </p>
              </div>
              <Badge tone="green">{a.status}</Badge>
            </div>
          ))
        ) : (
          <div className="calendar-hours">
            {[9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => (
              <div className="calendar-hour" key={hour}>
                <time>
                  {hour > 12 ? hour - 12 : hour}:00 {hour < 12 ? 'AM' : 'PM'}
                </time>
                <div>
                  {items
                    .filter((a) => new Date(a.startsAt).getUTCHours() - 7 === hour)
                    .map((a) => (
                      <Link
                        className={`calendar-event ${a.modality === 'in_person' ? 'event-green' : ''}`}
                        href={role === 'patient' ? '/patient/sessions' : '/therapist/telehealth'}
                        key={a.id}
                      >
                        <strong>
                          {role === 'patient' ? 'Maya Chen' : patientName(a.patientId)}
                        </strong>
                        <span>
                          {formatTime(a.startsAt)} · {a.title} ·{' '}
                          {a.modality === 'telehealth' ? 'Telehealth' : 'In person'}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {role === 'patient' && (
        <div className="bottom-actions">
          <p className="muted">Need a different time? Talk with your therapist.</p>
          <Link href="/patient/messages" className="pt-button pt-button--secondary">
            Message Maya
          </Link>
        </div>
      )}
      {role === 'therapist' && (
        <div className="bottom-actions">
          <DemoNote />
          <Button variant="secondary" onClick={add}>
            <Plus size={16} />
            Add sample appointment
          </Button>
        </div>
      )}
    </>
  );
}
function AppointmentModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (a: Appointment) => void;
}) {
  const [error, setError] = useState('');
  return (
    <Modal title="New sample appointment" open={open} onClose={onClose}>
      <DemoNote>Use synthetic details only. This is a local scheduling preview.</DemoNote>
      <form
        className="stack-form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const startsAt = new Date(String(data.get('time'))).toISOString();
          const parsed = appointmentSchema.safeParse({
            patientId: String(data.get('patient')),
            clinicianId: 'user-demo-therapist',
            title: 'Individual therapy',
            startsAt,
            endsAt: new Date(Date.parse(startsAt) + 50 * 60000).toISOString(),
            modality: data.get('modality'),
          });
          if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
          }
          onAdd({
            ...parsed.data,
            id: `appointment-local-${Date.now()}`,
            organizationId: 'org-demo',
            status: 'scheduled',
          });
        }}
      >
        <label className="pt-field">
          <span>Patient</span>
          <select name="patient">
            {demoPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Date and time (your device’s local time)"
          name="time"
          type="datetime-local"
          defaultValue="2026-10-26T14:00"
          required
        />
        <label className="pt-field">
          <span>Location</span>
          <select name="modality">
            <option value="telehealth">Telehealth</option>
            <option value="in_person">In person</option>
          </select>
        </label>
        <p className="form-hint">Sessions are 50 minutes in this preview.</p>
        {error && <p role="alert">{error}</p>}
        <Button type="submit">Add sample appointment</Button>
      </form>
    </Modal>
  );
}

function Patients() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All patients');
  const matches = demoPatients.filter(
    (p) =>
      p.displayName.toLowerCase().includes(search.toLowerCase()) &&
      (status === 'All patients' || p.status === 'active'),
  );
  return (
    <>
      <div className="page-toolbar">
        <SearchBar
          label="Search your caseload"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tabs items={['All patients', 'Active']} value={status} onChange={setStatus} />
      </div>
      <Card>
        <Table
          label="Sample patient caseload"
          headings={['Patient', 'Care status', 'Next appointment', 'Last session', '']}
        >
          {matches.map((p, i) => (
            <tr key={p.id}>
              <td>
                <Link className="person-cell" href={`/therapist/patients/${p.id}`}>
                  <Avatar initials={p.initials} color={i} />
                  <span>
                    <strong>{p.displayName}</strong>
                    <small>{p.email}</small>
                  </span>
                </Link>
              </td>
              <td>
                <Badge tone={p.status === 'active' ? 'green' : 'neutral'}>{p.status}</Badge>
              </td>
              <td>
                {i === 0
                  ? 'Oct 26 · 4:00 PM'
                  : i === 1
                    ? 'Oct 26 · 10:00 AM'
                    : i === 2
                      ? 'Oct 26 · 1:00 PM'
                      : '—'}
              </td>
              <td>{i === 0 ? 'Oct 19, 2026' : 'Sample not entered'}</td>
              <td>
                <Link
                  href={`/therapist/patients/${p.id}`}
                  className="icon-button"
                  aria-label={`Open ${p.displayName}`}
                >
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </Table>
        {matches.length === 0 && (
          <EmptyState
            title="No matching patients"
            description="Try another name or return to all patients."
          />
        )}
      </Card>
      <DemoNote>
        All four people are fictional. New patient invitation delivery is not configured.
      </DemoNote>
    </>
  );
}
function PatientProfile({ patientId }: { patientId: string }) {
  const patient = demoPatients.find((p) => p.id === patientId);
  if (!patient)
    return <EmptyState title="Patient not found" description="Return to your sample caseload." />;
  const appointment = demoAppointments.find((a) => a.patientId === patientId);
  return (
    <>
      <Card className="profile-summary">
        <Avatar initials={patient.initials} large color={1} />
        <div>
          <h2>{patient.displayName}</h2>
          <p>{patient.email} · Synthetic patient</p>
          <Badge tone={patient.status === 'active' ? 'green' : 'neutral'}>
            {patient.status === 'active' ? 'Active care' : 'Care paused'}
          </Badge>
        </div>
        {patientId === 'patient-demo-avery' && (
          <Link href="/therapist/messages" className="pt-button pt-button--secondary">
            <Icon name="message" size={16} />
            Message
          </Link>
        )}
      </Card>
      <div className="patient-card-grid">
        <Card className="padded-card">
          <h2>Care team</h2>
          <div className="person-cell">
            <Avatar initials="MC" />
            <span>
              <strong>{appointment ? 'Maya Chen' : 'No current assignment'}</strong>
              <small>{appointment ? 'Assigned clinician' : 'Paused sample record'}</small>
            </span>
          </div>
          <p>Individual therapy · Sample record</p>
        </Card>
        <Card className="padded-card">
          <h2>Next session</h2>
          <p>
            {appointment
              ? `${formatDate(appointment.startsAt)} · ${formatTime(appointment.startsAt)} · 50 min`
              : 'No sample appointment scheduled'}
          </p>
          <SmallLink href="/therapist/calendar">View calendar</SmallLink>
        </Card>
        <Card className="padded-card">
          <h2>Care direction</h2>
          <p>
            {patientId === 'patient-demo-avery'
              ? 'Building a little more balance through small, achievable steps.'
              : 'No sample treatment plan entered for this patient.'}
          </p>
          {patientId === 'patient-demo-avery' && (
            <SmallLink href="/therapist/treatment-plans">View treatment plan</SmallLink>
          )}
        </Card>
      </div>
      {patientId === 'patient-demo-avery' ? (
        <Journey role="therapist" />
      ) : (
        <Card>
          <EmptyState
            title="Their story starts here"
            description={`No sample journey events have been entered for ${patient.displayName}.`}
          />
        </Card>
      )}
    </>
  );
}
function Journey({ role }: { role: Mode }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All moments');
  const matches = demoJourney.filter(
    (item) =>
      `${item.title} ${item.description} ${item.themes.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === 'All moments' || item.type === (filter === 'Sessions' ? 'session' : 'resource')),
  );
  return (
    <>
      <div className="page-toolbar">
        <div className="patient-selector">
          <Avatar initials="AM" color={1} />
          <span>{role === 'patient' ? 'Your journey' : 'Avery Morgan’s journey'}</span>
        </div>
        <SearchBar
          label="Search moments and themes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Tabs items={['All moments', 'Sessions', 'Resources']} value={filter} onChange={setFilter} />
      <div className="timeline">
        <div className="timeline-month">OCTOBER 2026</div>
        {matches.map((item) => (
          <div className="timeline-row" key={item.id}>
            <div className="timeline-date">{formatDate(item.occurredAt)}</div>
            <div className="timeline-dot">
              <Icon name={item.type === 'session' ? 'sessions' : 'book'} size={17} />
            </div>
            <Card className="timeline-card">
              <div className="timeline-card-top">
                <Badge tone={item.type === 'session' ? 'teal' : 'green'}>
                  {item.type === 'session' ? 'Therapy session' : 'Shared resource'}
                </Badge>
                <span className="muted">
                  {item.type === 'session' ? '50 min with Maya Chen' : 'Between sessions'}
                </span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="timeline-card-footer">
                <div className="theme-list">
                  {item.themes.map((theme) => (
                    <span key={theme}>{theme}</span>
                  ))}
                </div>
                <SmallLink
                  href={
                    item.type === 'session'
                      ? `/${role}/sessions/${item.id === 'journey-demo-1' ? 'session-demo-1' : 'session-demo-2'}`
                      : `/${role}/resources`
                  }
                >
                  Explore
                </SmallLink>
              </div>
            </Card>
          </div>
        ))}
        {!matches.length && (
          <EmptyState
            title="No moments found"
            description="Try another theme or view all moments."
          />
        )}
      </div>
      <DemoNote>
        Journey events include only sample clinician-approved updates and shared resources in the
        patient view.
      </DemoNote>
    </>
  );
}
function Sessions({ role }: { role: Mode }) {
  const [search, setSearch] = useState('');
  const items = demoSessions.filter(
    (s) =>
      (role === 'therapist' || s.portalShared) &&
      `${s.title} ${s.themes}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="page-toolbar">
        <SearchBar
          label="Search sessions and themes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Badge>{items.length} sample sessions</Badge>
      </div>
      <div className="session-grid">
        {items.map((s, i) => (
          <Link className="session-card-link" href={`/${role}/sessions/${s.id}`} key={s.id}>
            <Card className="session-card">
              <div className={`session-art session-art-${i}`}>
                <Icon name="journey" size={44} />
                <span>SPACE TO GROW</span>
              </div>
              <div className="session-card-body">
                <span className="eyebrow">
                  {formatDate(s.startsAt)} · {s.durationMinutes} MIN
                </span>
                <h2>{s.title}</h2>
                <p>With Maya Chen · Individual therapy</p>
                <div className="theme-list">
                  {s.themes.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="session-card-bottom">
                  <Badge tone={s.portalShared ? 'green' : 'neutral'}>
                    {s.portalShared ? 'Shared in portal' : 'Clinician only'}
                  </Badge>
                  <ArrowRight size={18} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {!items.length && (
        <EmptyState
          title="No matching sessions"
          description="Try a theme such as boundaries or mindfulness."
        />
      )}
      <DemoNote>Recording is disabled. Session content is synthetic.</DemoNote>
    </>
  );
}
function SessionDetail({
  role,
  sessionId,
  replay,
  notify,
}: {
  role: Mode;
  sessionId: string;
  replay: boolean;
  notify: (s: string) => void;
}) {
  const session = demoSessions.find(
    (s) => s.id === sessionId && (role === 'therapist' || s.portalShared),
  );
  const [bookmarked, setBookmarked] = useState(false);
  if (!session)
    return (
      <EmptyState
        title="Session not available"
        description="Return to your authorized sample session library."
      />
    );
  const update = demoPatientUpdates.find((u) => u.sessionId === session.id);
  return (
    <>
      <Link href={`/${role}/sessions`} className="back-link">
        <ChevronLeft size={16} />
        Back to sessions
      </Link>
      <div className="session-detail-hero">
        <span className="eyebrow">
          {formatDate(session.startsAt).toUpperCase()}, 2026 · {session.durationMinutes} MINUTES
        </span>
        <h2>{session.title}</h2>
        <p>Individual therapy with Maya Chen</p>
        <div className="theme-list">
          {session.themes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </div>
      </div>
      <div className="detail-columns">
        <Card className="padded-card">
          <SectionHeading title={replay ? 'Replay & transcript' : 'A takeaway for your week'}>
            <Badge tone={session.portalShared ? 'green' : 'neutral'}>
              {session.portalShared ? 'Sample shared session' : 'Clinician-only sample'}
            </Badge>
          </SectionHeading>
          {replay ? (
            <>
              <div className="replay-placeholder">
                <Icon name="video" size={40} />
                <h3>No recording exists</h3>
                <p>
                  Recording is off by default. No audio, video, or transcript is captured in Phase
                  1.
                </p>
              </div>
              <div className="page-toolbar">
                <h3>Transcript</h3>
                <Button disabled>Search transcript</Button>
              </div>
              <EmptyState
                title="A transcript will appear here"
                description="Future access will depend on explicit consent, clinician sharing, retention rules, and record-access rights."
              />
            </>
          ) : update ? (
            <>
              <p className="large-copy">{update.content}</p>
              <div className="note-author">
                <Avatar initials="MC" />
                <span>
                  Maya Chen
                  <small>Sample clinician-approved update · {formatDate(session.startsAt)}</small>
                </span>
              </div>
              <div className="gentle-divider" />
              <h3>A small practice</h3>
              <p>Try a five-minute grounding exercise when you have a quiet moment.</p>
              <SmallLink href={`/${role}/resources`}>Open your resource</SmallLink>
            </>
          ) : (
            <EmptyState
              title="No shared takeaway yet"
              description="This sample session does not have a clinician-approved patient update."
            />
          )}
        </Card>
        <div>
          <Card className="padded-card">
            <h2>Session materials</h2>
            <div className="material-row">
              <Icon name="video" />
              <span>
                Recording<small>Disabled · No media captured</small>
              </span>
            </div>
            <div className="material-row">
              <Icon name="notes" />
              <span>
                Transcript<small>No transcript available</small>
              </span>
            </div>
            {role === 'patient' && (
              <Link
                href={`/patient/sessions/${session.id}/replay`}
                className="pt-button pt-button--secondary full-width"
              >
                Explore replay layout
                <ArrowRight size={15} />
              </Link>
            )}
            <Button
              className="full-width spaced"
              variant="secondary"
              aria-pressed={bookmarked}
              onClick={() => {
                setBookmarked(!bookmarked);
                notify(
                  bookmarked
                    ? 'Sample bookmark removed locally.'
                    : 'Sample bookmark added in this page. It resets on navigation.',
                );
              }}
            >
              <Icon name="bookmark" size={16} />
              {bookmarked ? 'Bookmarked in preview' : 'Preview bookmark'}
            </Button>
          </Card>
          <div className="inline-note spaced">
            <Icon name="shield" size={18} />
            <p>
              Clinical progress notes, psychotherapy notes, shared updates, and your journal have
              separate access rules.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Messages({ role }: { role: Mode }) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(
    demoMessages.map((m) => ({ content: m.content, own: false })),
  );
  const [error, setError] = useState('');
  return (
    <>
      <div className="communication-note">
        <Icon name="help" size={17} />
        <p>
          For non-urgent conversations. This demo is not monitored and does not deliver messages.
          For immediate danger, contact your local emergency services.
        </p>
      </div>
      <Card className="messenger">
        <aside className="conversation-list">
          <SearchBar label="Search conversations" />
          <div className="conversation-active">
            <Avatar initials={role === 'patient' ? 'MC' : 'AM'} color={1} />
            <div>
              <strong>{role === 'patient' ? 'Maya Chen' : 'Avery Morgan'}</strong>
              <p>Shared a grounding exercise</p>
            </div>
            <span className="status-dot" />
          </div>
        </aside>
        <div className="conversation">
          <div className="conversation-header">
            <Avatar initials={role === 'patient' ? 'MC' : 'AM'} />
            <div>
              <strong>{role === 'patient' ? 'Maya Chen' : 'Avery Morgan'}</strong>
              <span>
                {role === 'patient' ? 'Your therapist' : 'Synthetic patient'} · Demo conversation
              </span>
            </div>
          </div>
          <div className="message-date">WEDNESDAY, OCTOBER 21</div>
          <div className="message-stream" aria-live="polite">
            {messages.map((message, i) => (
              <div className={`message-bubble ${message.own ? 'message-own' : ''}`} key={i}>
                <p>{message.content}</p>
                <small>
                  {message.own ? 'Local demo draft · Not delivered' : '10:30 AM · Synthetic sample'}
                </small>
              </div>
            ))}
          </div>
          <form
            className="message-composer"
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = messageSchema.safeParse({ content: draft });
              if (!parsed.success) {
                setError(parsed.error.issues[0].message);
                return;
              }
              setMessages([...messages, { content: parsed.data.content, own: true }]);
              setDraft('');
              setError('');
            }}
          >
            <label className="sr-only" htmlFor="message-draft">
              Sample message
            </label>
            <textarea
              id="message-draft"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a sample message…"
              maxLength={4000}
            />
            {error && <p role="alert">{error}</p>}
            <div>
              <span>Local preview only · Resets on refresh</span>
              <Button type="submit">
                Add to preview
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        </div>
      </Card>
      <p className="form-hint">
        Response-time preferences and encrypted production message delivery are planned for a later
        phase.
      </p>
    </>
  );
}
function CarePlan() {
  const [checked, setChecked] = useState<string[]>([]);
  return (
    <>
      <div className="care-plan-intro">
        <Icon name="target" size={28} />
        <div>
          <span className="eyebrow">YOUR SHARED DIRECTION</span>
          <h2>Building a little more balance</h2>
          <p>Small, achievable practices to support the life that matters to you.</p>
        </div>
        <Badge tone="green">Active sample plan</Badge>
      </div>
      <div className="goals-list">
        {demoGoals.map((goal, i) => (
          <Card className="goal-card" key={goal.id}>
            <span className="goal-number">0{i + 1}</span>
            <div>
              <h2>{goal.title}</h2>
              <p>{goal.description}</p>
              <div className="progress-with-label">
                <span className="progress-bar">
                  <i style={{ width: `${goal.progress}%` }} />
                </span>
                <span>{goal.progress}% · Sample progress</span>
              </div>
            </div>
            <button
              className={`goal-check ${checked.includes(goal.id) ? 'checked' : ''}`}
              aria-pressed={checked.includes(goal.id)}
              onClick={() =>
                setChecked(
                  checked.includes(goal.id)
                    ? checked.filter((id) => id !== goal.id)
                    : [...checked, goal.id],
                )
              }
            >
              {checked.includes(goal.id) ? '✓ Practiced' : 'Mark practiced'}
            </button>
          </Card>
        ))}
      </div>
      <DemoNote>
        Practicing is a local interaction. Sample progress percentages do not change and are not
        clinical assessments.
      </DemoNote>
    </>
  );
}
function Resources({ role, notify }: { role: Mode; notify: (s: string) => void }) {
  const [filter, setFilter] = useState('All resources');
  const [selected, setSelected] = useState<string | null>(null);
  const resources = demoResources.filter(
    (r) =>
      filter === 'All resources' ||
      r.category === (filter === 'Exercises' ? 'exercise' : 'worksheet'),
  );
  return (
    <>
      <div className="page-toolbar">
        <Tabs
          items={['All resources', 'Exercises', 'Worksheets']}
          value={filter}
          onChange={setFilter}
        />
        <span className="muted">Shared by Maya Chen</span>
      </div>
      <div className="resource-grid">
        {resources.map((r, i) => (
          <Card className="resource-card" key={r.id}>
            <div className={`resource-visual resource-visual-${i}`}>
              <Icon name={r.category === 'exercise' ? 'journey' : 'notes'} size={44} />
              <span>
                {r.category === 'exercise' ? 'A MOMENT TO RESET' : 'SPACE FOR REFLECTION'}
              </span>
            </div>
            <div className="padded-card">
              <Badge tone="green">
                {r.category} · {r.durationMinutes} min
              </Badge>
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <Button variant="secondary" onClick={() => setSelected(r.id)}>
                {role === 'patient' ? 'Open resource' : 'Preview resource'}
                <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        title={demoResources.find((r) => r.id === selected)?.title || 'Resource'}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        <DemoNote>Illustrative content, not a personalized clinical recommendation.</DemoNote>
        {selected === 'resource-demo-1' ? (
          <>
            <p>
              Take a comfortable pause and notice your surroundings. This is a sample of how an
              assigned exercise could appear.
            </p>
            <ol className="exercise-steps">
              <li>Notice five things you can see.</li>
              <li>Notice four things you can feel.</li>
              <li>Notice three things you can hear.</li>
              <li>Notice two things you can smell.</li>
              <li>Notice one thing you can taste.</li>
            </ol>
            <p>
              Skip anything that feels uncomfortable and discuss your experience with your
              therapist.
            </p>
          </>
        ) : (
          <>
            <p>Sample reflection prompts:</p>
            <ol className="exercise-steps">
              <li>What felt meaningful to you this week?</li>
              <li>Which small choice reflected a value you care about?</li>
              <li>What would you like to explore in your next session?</li>
            </ol>
          </>
        )}
        <Button
          onClick={() => {
            setSelected(null);
            notify('Sample resource marked as explored for this preview.');
          }}
        >
          Mark explored in preview
        </Button>
      </Modal>
    </>
  );
}
function Journal() {
  const [entries, setEntries] = useState<{ title: string; content: string }[]>([]);
  const [error, setError] = useState('');
  return (
    <div className="detail-columns">
      <Card className="padded-card">
        <div className="eyebrow">A MOMENT FOR YOU</div>
        <h2>What’s on your mind?</h2>
        <p>
          Your journal is a distinct patient-private record type. In this demo, entries exist only
          in this page’s memory.
        </p>
        <DemoNote>
          Please enter sample reflections only. This preview is not a secure journal.
        </DemoNote>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const parsed = journalEntrySchema.safeParse({
              title: data.get('title'),
              content: data.get('content'),
            });
            if (!parsed.success) {
              setError(parsed.error.issues[0].message);
              return;
            }
            setEntries([parsed.data, ...entries]);
            e.currentTarget.reset();
            setError('');
          }}
        >
          <Input
            label="A title for this moment"
            name="title"
            placeholder="A small thing I noticed"
            required
            maxLength={160}
          />
          <label className="pt-field">
            <span>Your reflection</span>
            <textarea
              name="content"
              placeholder="Today, I noticed…"
              rows={7}
              required
              maxLength={10000}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button type="submit">Save sample reflection</Button>
        </form>
      </Card>
      <div>
        <SectionHeading title="Your reflections" />
        {!entries.length ? (
          <Card>
            <EmptyState
              title="Room for your first thought"
              description="Your sample reflection will appear here. It will disappear when you leave or refresh this page."
            />
          </Card>
        ) : (
          entries.map((entry, i) => (
            <Card className="padded-card spaced" key={i}>
              <Badge>Local preview</Badge>
              <h3>{entry.title}</h3>
              <p className="preserve-lines">{entry.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
function Telehealth() {
  return (
    <>
      <div className="telehealth-layout">
        <div className="video-preview">
          <div className="video-preview-center">
            <Avatar initials="MC" large />
            <h2>Your space to connect</h2>
            <p>No camera or microphone is accessed.</p>
            <Badge>Telehealth workspace preview</Badge>
          </div>
          <div className="video-controls">
            <span>
              <Icon name="video" />
              Camera off
            </span>
            <span>
              <Icon name="lock" />
              Recording off
            </span>
            <Button disabled>Join session</Button>
          </div>
        </div>
        <Card className="padded-card">
          <h2>Session preparation</h2>
          <p>
            Avery Morgan
            <br />
            Monday, Oct 26 · 4:00 PM
          </p>
          <div className="gentle-divider" />
          <div className="material-row">
            <Icon name="shield" />
            <span>
              Recording disabled<small>No media consent requested</small>
            </span>
          </div>
          <p>
            Video calls, waiting room access, and recording controls require a configured provider
            and verified consent workflows.
          </p>
          <SmallLink href="/therapist/consent">Review privacy foundation</SmallLink>
        </Card>
      </div>
      <DemoNote>
        No real telehealth, audio, video, recording, or transcription service is connected.
      </DemoNote>
    </>
  );
}

function AdditionalPage({
  role,
  slug,
  notify,
}: {
  role: Mode;
  slug: string;
  notify: (s: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [read, setRead] = useState(false);
  const [toggles, setToggles] = useState([true, false, true]);
  const patient = role === 'patient';
  if (['notes', 'psychotherapy-notes', 'updates'].includes(slug)) {
    const psychotherapy = slug === 'psychotherapy-notes';
    const update = slug === 'updates';
    return (
      <>
        <div className="privacy-callout">
          <Icon name={psychotherapy ? 'lock' : 'notes'} size={23} />
          <div>
            <strong>
              {psychotherapy
                ? 'Separately maintained psychotherapy notes'
                : update
                  ? 'Patient-facing updates'
                  : 'Ordinary clinical progress notes'}
            </strong>
            <p>
              {psychotherapy
                ? 'Process notes have a distinct record type and restricted clinician access. They are never automatically shared in the portal.'
                : update
                  ? 'These updates are distinct from clinical notes. Production sharing will require an explicit clinician review and approval.'
                  : 'Clinical documentation remains distinct from psychotherapy process notes, patient-facing updates, and patient-private journals.'}
            </p>
          </div>
          <Badge tone="amber">Synthetic preview</Badge>
        </div>
        <div className="detail-columns">
          <Card className="padded-card">
            <SectionHeading title={update ? 'Prepare a patient update' : 'Sample draft'}>
              <Badge>Draft · Not a clinical record</Badge>
            </SectionHeading>
            <div className="person-cell">
              <Avatar initials="AM" color={1} />
              <span>
                <strong>Avery Morgan</strong>
                <small>Oct 19 · Making room for what matters</small>
              </span>
            </div>
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSaved(true);
              }}
            >
              <label className="pt-field">
                <span>{update ? 'A takeaway for the patient' : 'Synthetic note content'}</span>
                <textarea
                  rows={9}
                  required
                  maxLength={10000}
                  defaultValue={
                    update
                      ? demoPatientUpdates[0].content
                      : psychotherapy
                        ? 'Illustrative process-note draft. This record is maintained separately and is accessible only to an authorized authoring clinician.'
                        : 'Sample progress note: Met for a 50-minute individual session. Reviewed weekly routines and a small boundary practice. This is fictional documentation.'
                  }
                />
              </label>
              <DemoNote>
                Use sample content only. No clinical storage, signing, or sharing is connected.
              </DemoNote>
              <Button type="submit">Keep draft in preview</Button>
              {saved && (
                <p role="status" className="success-text">
                  Sample draft kept in this page. It resets when you leave.
                </p>
              )}
            </form>
          </Card>
          <Card className="padded-card self-start">
            <h2>{psychotherapy ? 'Distinct access boundary' : 'Review before sharing'}</h2>
            <p>
              {psychotherapy
                ? 'The API authorization and database policy foundation isolate psychotherapy notes from ordinary progress notes and from patient portal queries.'
                : 'Production workflows will include version history, author attribution, signing, audit events, and patient record-access handling.'}
            </p>
            <div className="material-row">
              <Icon name="shield" />
              <span>
                Portal sharing
                <small>{update ? 'Approval workflow planned' : 'Excluded by default'}</small>
              </span>
            </div>
            <SmallLink href="/therapist/consent">Consent & privacy</SmallLink>
          </Card>
        </div>
      </>
    );
  }
  if (slug === 'billing')
    return (
      <>
        <div className="stat-grid three-stats">
          {[
            { label: 'Sample billed', value: '$150.00' },
            { label: 'Sample paid', value: '$150.00' },
            { label: 'Sample balance', value: '$0.00' },
          ].map((stat) => (
            <Card className="stat-card" key={stat.label}>
              <span className="muted">{stat.label}</span>
              <strong className="stat-value">{stat.value}</strong>
              <p>Synthetic invoice data</p>
            </Card>
          ))}
        </div>
        <Card>
          <SectionHeading title={patient ? 'Your receipts' : 'Recent invoices'}>
            <Badge>Payment provider not connected</Badge>
          </SectionHeading>
          <Table
            headings={['Invoice', 'Patient', 'Amount', 'Status', '']}
            label="Synthetic invoices"
          >
            {demoInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <strong>{invoice.description}</strong>
                  <small className="cell-small">PT-DEMO-001</small>
                </td>
                <td>Avery Morgan</td>
                <td>${(invoice.amountCents / 100).toFixed(2)}</td>
                <td>
                  <Badge tone="green">Sample paid</Badge>
                </td>
                <td>
                  <Button variant="ghost" onClick={() => setSelected('Receipt preview')}>
                    View receipt
                    <ChevronRight size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
        <DemoNote>
          No charges, refunds, payment collection, or insurance submissions can be made.
        </DemoNote>
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Sample receipt">
          <Badge>SYNTHETIC · NOT VALID FOR PAYMENT</Badge>
          <h3>Willow Therapy</h3>
          <p>
            Individual therapy · October 19, 2026
            <br />
            Avery Morgan · $150.00 USD
            <br />
            Status: paid in synthetic sample data
          </p>
          <p>No payment was processed. Tax and provider identifiers are intentionally absent.</p>
        </Modal>
      </>
    );
  if (slug === 'insurance')
    return (
      <>
        <div className="privacy-callout">
          <Icon name="shield" />
          <div>
            <strong>A foundation for claims workflows</strong>
            <p>
              Eligibility, clearinghouse connections, payer enrollment, and claim submission are not
              configured.
            </p>
          </div>
          <Badge tone="amber">Not connected</Badge>
        </div>
        <Card>
          <Table
            label="Planned insurance workflow"
            headings={['Workflow', 'Example', 'Availability']}
          >
            <tr>
              <td>Coverage verification</td>
              <td>Patient coverage and benefits</td>
              <td>
                <Badge>Phase 2</Badge>
              </td>
            </tr>
            <tr>
              <td>Claim preparation</td>
              <td>Clinician-reviewed claim drafts</td>
              <td>
                <Badge>Phase 2</Badge>
              </td>
            </tr>
            <tr>
              <td>Submission & remittance</td>
              <td>Clearinghouse integration</td>
              <td>
                <Badge>Phase 2</Badge>
              </td>
            </tr>
          </Table>
        </Card>
      </>
    );
  if (slug === 'reports')
    return (
      <>
        <div className="stat-grid three-stats">
          {[
            { label: 'Sample sessions', value: '3' },
            { label: 'Active caseload', value: '3' },
            { label: 'Sample revenue', value: '$150' },
          ].map((s) => (
            <Card key={s.label} className="stat-card">
              <span className="muted">{s.label}</span>
              <strong className="stat-value">{s.value}</strong>
              <p>Illustrative · October 2026</p>
            </Card>
          ))}
        </div>
        <Card className="padded-card">
          <SectionHeading title="A week of care">
            <Badge>Synthetic activity</Badge>
          </SectionHeading>
          <div
            className="bar-chart"
            role="img"
            aria-label="Synthetic appointments: Monday 3, Tuesday through Friday 0"
          >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={day}>
                <strong>{i === 0 ? '3' : '0'}</strong>
                <span style={{ height: i === 0 ? 160 : 4 }} />
                <small>{day}</small>
              </div>
            ))}
          </div>
          <p className="form-hint">
            Three sample appointments are scheduled on Monday, October 26. These are preview
            figures, not clinical outcomes.
          </p>
        </Card>
      </>
    );
  if (slug === 'team')
    return (
      <>
        <Card>
          <SectionHeading title="Your sample practice team">
            <Badge>5 role types</Badge>
          </SectionHeading>
          <Table
            label="Synthetic users and practice roles"
            headings={['Team member', 'Practice role', 'Membership', 'Access design']}
          >
            {demoUsers.slice(0, 5).map((user, i) => (
              <tr key={user.id}>
                <td>
                  <div className="person-cell">
                    <Avatar initials={user.initials} color={i} />
                    <span>
                      <strong>{user.displayName}</strong>
                      <small>{user.email}</small>
                    </span>
                  </div>
                </td>
                <td>
                  {
                    {
                      clinician: 'Therapist / Clinician',
                      patient: 'Patient',
                      owner: 'Practice Owner',
                      administrator: 'Practice Administrator',
                      billing: 'Billing Staff',
                    }[demoMemberships[i].roles[0]]
                  }
                </td>
                <td>
                  <Badge tone="green">Active · Willow Therapy</Badge>
                </td>
                <td>
                  <Button variant="ghost" onClick={() => setSelected(demoMemberships[i].roles[0])}>
                    View scope
                    <ArrowRight size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
        <DemoNote>
          Navigation is a user experience layer. Practice, role, assignment, and ownership checks
          are enforced separately in the API.
        </DemoNote>
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Role authorization scope">
          <p>
            {selected === 'owner' || selected === 'administrator'
              ? 'Practice administration does not grant blanket access to clinical records. Clinical access requires the appropriate clinician role and patient assignment.'
              : selected === 'clinician'
                ? 'A clinician must hold an active practice membership and an active patient assignment. Separately maintained psychotherapy notes have additional author restrictions.'
                : selected === 'billing'
                  ? 'Billing staff have access to authorized billing workflows without access to clinical notes, psychotherapy notes, or patient-private journals.'
                  : 'Patients may access their own authorized, portal-shared records. Patient-private journal entries remain separate from clinician-facing records.'}
          </p>
          <p>
            Users can have multiple practice memberships and roles. Tenant selection never grants
            access by itself.
          </p>
        </Modal>
      </>
    );
  if (slug === 'forms' || slug === 'consent')
    return (
      <>
        <div className="detail-columns">
          <Card>
            <SectionHeading title={slug === 'consent' ? 'Consent overview' : 'Intake forms'}>
              <Badge>Synthetic examples</Badge>
            </SectionHeading>
            {slug === 'forms'
              ? demoForms.map((form) => (
                  <div className="list-row" key={form.id}>
                    <span className="feature-icon">
                      <Icon name="forms" />
                    </span>
                    <div>
                      <strong>{form.title}</strong>
                      <p>Review before your next session</p>
                    </div>
                    <Button variant="secondary" onClick={() => setSelected('form')}>
                      Preview form
                    </Button>
                  </div>
                ))
              : demoConsents.map((consent) => (
                  <div className="list-row" key={consent.id}>
                    <Icon name={consent.purpose === 'recording' ? 'video' : 'shield'} />
                    <div>
                      <strong>
                        {consent.purpose === 'recording'
                          ? 'Recording consent'
                          : 'Treatment consent'}
                      </strong>
                      <p>
                        {consent.purpose === 'recording'
                          ? 'Not requested · Recording remains disabled'
                          : 'Granted in fictional sample record'}
                      </p>
                    </div>
                    <Badge tone={consent.status === 'granted' ? 'green' : 'neutral'}>
                      {consent.status}
                    </Badge>
                  </div>
                ))}
          </Card>
          <Card className="padded-card self-start">
            <Icon name="shield" size={27} />
            <h2>Your choices matter</h2>
            <p>
              Consent to treatment, telehealth, recording, and routine portal sharing are distinct
              choices.
            </p>
            <p>
              Recording stays off in Phase 1. No real consent can be signed or withdrawn in this
              preview.
            </p>
            {patient ? (
              <SmallLink href="/patient/records">Request your records</SmallLink>
            ) : (
              <SmallLink href="/therapist/psychotherapy-notes">Separate note access</SmallLink>
            )}
          </Card>
        </div>
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Intake form preview">
          <DemoNote>No answers are submitted or stored.</DemoNote>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSelected(null);
              notify('Sample form preview completed. No real intake data was submitted.');
            }}
          >
            <Input label="Preferred sample name" placeholder="Avery" maxLength={120} />
            <label className="pt-field">
              <span>What would you like to explore?</span>
              <textarea rows={4} placeholder="Use fictional details only." maxLength={4000} />
            </label>
            <Button type="submit">Finish sample preview</Button>
          </form>
        </Modal>
      </>
    );
  if (slug === 'settings')
    return (
      <div className="settings-layout">
        <Card className="padded-card">
          <SectionHeading title={patient ? 'Your preferences' : 'Practice preferences'}>
            <Badge>Preview only</Badge>
          </SectionHeading>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
            }}
          >
            <Input
              label={patient ? 'Display name' : 'Practice name'}
              defaultValue={patient ? 'Avery Morgan' : 'Willow Therapy'}
              required
              maxLength={120}
            />
            <label className="pt-field">
              <span>Time zone</span>
              <select>
                <option>America/Los_Angeles</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </label>
            <div className="gentle-divider" />
            {[
              'Appointment reminders',
              'Between-session resource updates',
              'Message notifications',
            ].map((label, i) => (
              <label className="toggle-row" key={label}>
                <span>
                  <strong>{label}</strong>
                  <small>Preference preview · No notification delivery</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={toggles[i]}
                  onChange={() => setToggles(toggles.map((value, j) => (j === i ? !value : value)))}
                />
              </label>
            ))}
            <Button type="submit">Keep preferences in preview</Button>
            {saved && (
              <p className="success-text" role="status">
                Preferences updated locally. They reset on refresh.
              </p>
            )}
          </form>
        </Card>
        <Card className="padded-card self-start">
          <h2>Account foundation</h2>
          <p>
            Production sign-in, session management, email delivery, multi-factor authentication, and
            account recovery require a configured provider.
          </p>
          <SmallLink href="/recover-account">Explore recovery interface</SmallLink>
          <div className="gentle-divider" />
          <h3>Data boundaries</h3>
          <p>
            Only synthetic data belongs in this preview. No compliance certification is claimed.
          </p>
        </Card>
      </div>
    );
  if (slug === 'notifications')
    return (
      <Card>
        <SectionHeading title="Recent updates">
          <Button variant="ghost" onClick={() => setRead(true)}>
            {read ? 'All read in preview' : 'Mark all read'}
          </Button>
        </SectionHeading>
        <div className="list-row">
          <span className="feature-icon">
            <Icon name="book" />
          </span>
          <div>
            <strong>A new resource is ready</strong>
            <p>
              {patient
                ? 'Maya shared a grounding exercise.'
                : 'A grounding exercise was shared with Avery.'}
            </p>
            <small>Oct 21 · Synthetic notification</small>
          </div>
          {!read && <span className="status-dot" />}
          <Link
            className="icon-button"
            href={`/${role}/resources`}
            aria-label="View shared resource"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="list-row">
          <span className="feature-icon blue">
            <Icon name="calendar" />
          </span>
          <div>
            <strong>Your next session</strong>
            <p>Monday, October 26 · 4:00 PM</p>
            <small>Sample reminder · No push or email sent</small>
          </div>
          <Link
            className="icon-button"
            href={`/${role}/${patient ? 'appointments' : 'calendar'}`}
            aria-label="View appointment"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </Card>
    );
  if (slug === 'records')
    return (
      <div className="detail-columns">
        <Card className="padded-card">
          <Icon name="download" size={26} />
          <h2>Access to your care records</h2>
          <p>
            Routine portal sharing and lawful records-access requests are separate workflows. Your
            therapist’s sharing preferences do not replace applicable access rights.
          </p>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              if (recordsAccessRequestSchema.safeParse({ scope: data.get('scope') }).success)
                setSaved(true);
            }}
          >
            <label className="pt-field">
              <span>What would you like to request?</span>
              <select name="scope">
                <option value="clinical_record">My clinical record</option>
                <option value="session_materials">Session materials</option>
                <option value="other">Another record or question</option>
              </select>
            </label>
            <DemoNote>No request is delivered in Phase 1.</DemoNote>
            <Button type="submit">Prepare sample request</Button>
            {saved && (
              <p role="status" className="success-text">
                Sample request prepared locally. In production it will be routed for identity
                verification and review.
              </p>
            )}
          </form>
        </Card>
        <Card className="padded-card self-start">
          <h2>A thoughtful review process</h2>
          <p>
            Production requests will include identity verification, request tracking, response
            deadlines, exceptions review, and an audit history.
          </p>
          <p>Separately maintained psychotherapy notes require distinct legal and access review.</p>
          <SmallLink href="/patient/help">Questions about access?</SmallLink>
        </Card>
      </div>
    );
  if (slug === 'data')
    return (
      <>
        <div className="patient-card-grid">
          <Card className="padded-card">
            <Icon name="download" size={28} />
            <h2>Import practice records</h2>
            <p>
              Future imports will include validation, tenant assignment, duplicate review, and a
              safe preview.
            </p>
            <Button disabled>Import unavailable</Button>
          </Card>
          <Card className="padded-card">
            <ArrowDown size={28} />
            <h2>Export practice data</h2>
            <p>
              Production exports will require scoped authorization, audit logging, and secure
              delivery.
            </p>
            <Button disabled>Export unavailable</Button>
          </Card>
          <Card className="padded-card">
            <Icon name="shield" size={28} />
            <h2>A deliberate transition</h2>
            <p>
              No files are uploaded, downloaded, or connected to a patient database in this phase.
            </p>
            <Badge>Phase 2 planning</Badge>
          </Card>
        </div>
        <DemoNote>
          The PostgreSQL migration is a reviewed-in-source starting point and has not been applied
          to a database.
        </DemoNote>
      </>
    );
  if (slug === 'bookmarks')
    return (
      <Card>
        <EmptyState
          title="Keep the moments that matter"
          description="Authorized timecoded bookmarks will appear here when recording and transcript workflows are available."
        >
          <Link href="/patient/sessions" className="pt-button pt-button--secondary">
            Explore shared sessions
            <ArrowRight size={16} />
          </Link>
        </EmptyState>
      </Card>
    );
  if (slug === 'onboarding')
    return (
      <>
        <div className="onboarding-intro">
          <Icon name="sparkles" size={30} />
          <h2>A thoughtful start to your practice</h2>
          <p>
            Your local preview is ready to explore. Production setup will happen in a later phase.
          </p>
        </div>
        <Card>
          {[
            {
              title: 'Explore your workspace',
              description: 'Get familiar with the calendar, caseload, and patient journey.',
              href: '/therapist/today',
              label: 'Ready to explore',
            },
            {
              title: 'Shape your practice',
              description: 'Review team roles, preferences, and clinical access boundaries.',
              href: '/therapist/settings',
              label: 'Preview settings',
            },
            {
              title: 'Experience the patient portal',
              description: 'See the next useful step from your patient’s perspective.',
              href: '/patient/home',
              label: 'Open patient view',
            },
          ].map((step, i) => (
            <div className="list-row" key={step.title}>
              <span className="goal-number">0{i + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
              <Link href={step.href} className="text-link">
                {step.label}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </Card>
      </>
    );
  return (
    <>
      <div className="help-intro">
        <Icon name="help" size={32} />
        <h2>A little guidance, whenever you need it.</h2>
        <p>
          This is a local synthetic preview of Patient Touch. No support messages are monitored
          here.
        </p>
      </div>
      <div className="patient-card-grid">
        {[
          {
            title: 'Find your next appointment',
            copy: 'Your upcoming session and location are in Appointments.',
            href: '/patient/appointments',
            label: 'View appointments',
          },
          {
            title: 'Understand shared session content',
            copy: 'Only approved takeaways and shared materials appear in your session library.',
            href: '/patient/sessions',
            label: 'Explore sessions',
          },
          {
            title: 'Request access to records',
            copy: 'A dedicated workflow keeps access requests separate from routine portal sharing.',
            href: '/patient/records',
            label: 'View records access',
          },
        ].map((item) => (
          <Card className="padded-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
            <SmallLink href={item.href}>{item.label}</SmallLink>
          </Card>
        ))}
      </div>
      <div className="communication-note">
        <Icon name="help" />
        <p>
          Patient Touch is not an emergency service. For immediate danger, contact your local
          emergency services. Production response-time guidance will be set by your care team.
        </p>
      </div>
    </>
  );
}
