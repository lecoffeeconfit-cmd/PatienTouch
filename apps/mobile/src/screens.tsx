import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import {
  demoAppointments,
  demoForms,
  demoGoals,
  demoInvoices,
  demoJourney,
  demoNotifications,
  demoPatient,
  demoPatients,
  demoPatientUpdates,
  demoResources,
  demoSessions,
  demoTherapist,
} from '@patient-touch/types/demo';
import { useDemo } from './demo';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chips,
  Empty,
  Field,
  Icon,
  Notice,
  Row,
  Screen,
  Search,
  Section,
  c,
  s,
  type IconName,
} from './ui';

const go = (path: string) => router.push(path as Href);
const feature = (slug: string) => go(`/feature/${slug}`);
const shortDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
const time = (date: string) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });
const nextAppointment = demoAppointments.find((item) => item.patientId === demoPatient.id)!;

function AppointmentCard({
  appointment,
  compact = false,
}: {
  appointment: typeof nextAppointment;
  compact?: boolean;
}) {
  const { role } = useDemo();
  const patient = demoPatients.find((person) => person.id === appointment.patientId);
  return (
    <Card>
      <View style={s.between}>
        <Badge text={appointment.modality === 'telehealth' ? 'Telehealth' : 'In person'} />
        <Text style={s.footnote}>{shortDate(appointment.startsAt)} · Sample</Text>
      </View>
      <View style={s.horizontal}>
        <Avatar initials={role === 'therapist' ? (patient?.initials ?? 'PT') : 'MC'} />
        <View style={s.flex}>
          <Text style={s.rowTitle}>
            {role === 'therapist' ? patient?.displayName : 'Maya Chen, therapist'}
          </Text>
          <Text style={s.rowSubtitle}>{appointment.title}</Text>
        </View>
      </View>
      <View style={s.between}>
        <Text style={[s.rowTitle, { fontSize: 20 }]}>{time(appointment.startsAt)}</Text>
        <Text style={s.body}>50 minutes</Text>
      </View>
      {!compact && (
        <Button
          title="View appointment"
          icon="calendar-outline"
          onPress={() => go(`/feature/appointment?appointmentId=${appointment.id}`)}
        />
      )}
    </Card>
  );
}
function GoalCards() {
  return (
    <>
      {demoGoals
        .filter((goal) => goal.portalShared)
        .map((goal) => (
          <Card key={goal.id}>
            <View style={s.between}>
              <Icon name="flag-outline" color={c.teal} />
              <Text style={s.link}>{goal.progress}%</Text>
            </View>
            <Text style={s.rowTitle}>{goal.title}</Text>
            <Text style={s.body}>{goal.description}</Text>
            <View
              accessible
              accessibilityLabel={`${goal.progress} percent progress`}
              style={s.progressTrack}
            >
              <View style={[s.progressFill, { width: `${goal.progress}%` }]} />
            </View>
          </Card>
        ))}
    </>
  );
}
function ResourceCards() {
  const { completedResources, toggleResource } = useDemo();
  return (
    <>
      {demoResources.map((resource) => {
        const completed = completedResources.includes(resource.id);
        return (
          <Card key={resource.id}>
            <View style={s.between}>
              <Badge text={resource.category} />
              <Text style={s.footnote}>{resource.durationMinutes} minutes</Text>
            </View>
            <Text style={s.rowTitle}>{resource.title}</Text>
            <Text style={s.body}>{resource.description}</Text>
            <Button
              secondary
              title={completed ? 'Completed · tap to undo' : 'Mark as practiced'}
              icon={completed ? 'checkmark-circle-outline' : 'ellipse-outline'}
              onPress={() => toggleResource(resource.id)}
            />
          </Card>
        );
      })}
    </>
  );
}
export function HomeScreen() {
  const { role } = useDemo();
  if (role === 'patient')
    return (
      <Screen
        title="A little space for you."
        subtitle="Welcome back, Avery. Your next small step starts here."
      >
        <Card tint>
          <View style={s.between}>
            <Badge text="YOUR NEXT SESSION" />
            <Icon name="leaf-outline" color={c.teal} size={28} />
          </View>
          <Text style={[s.rowTitle, { fontSize: 24, lineHeight: 31 }]}>Monday, October 26</Text>
          <Text style={s.body}>4:00 PM · 50 minutes · Telehealth</Text>
          <View style={s.horizontal}>
            <Avatar initials="MC" />
            <View>
              <Text style={s.rowTitle}>Maya Chen</Text>
              <Text style={s.rowSubtitle}>Your therapist · sample appointment</Text>
            </View>
          </View>
          <Button
            title="View appointment"
            onPress={() => feature('appointment')}
            icon="arrow-forward"
          />
        </Card>
        <Section title="Between sessions" />
        <Card>
          <Row
            title="How are you arriving today?"
            subtitle="Take a quiet moment to check in with yourself."
            icon="create-outline"
          />
          <Button title="Write a reflection" secondary onPress={() => go('/journal')} />
        </Card>
        <Section title="A note from Maya" />
        <Card>
          <Text style={s.rowTitle}>{demoPatientUpdates[0]?.title}</Text>
          <Text style={s.body}>{demoPatientUpdates[0]?.content}</Text>
          <Text style={s.footnote}>Clinician-approved patient update · synthetic</Text>
        </Card>
        <Section title="Something to try" action="Care plan" onPress={() => go('/care')} />
        <ResourceCards />
      </Screen>
    );
  return (
    <Screen title="Good morning, Maya." subtitle="A little clarity for the day ahead.">
      <View style={local.stats}>
        <Card style={local.stat}>
          <Text style={s.bigNumber}>3</Text>
          <Text style={s.footnote}>Sessions today</Text>
        </Card>
        <Card style={local.stat}>
          <Text style={s.bigNumber}>1</Text>
          <Text style={s.footnote}>New message</Text>
        </Card>
        <Card style={local.stat}>
          <Text style={s.bigNumber}>2</Text>
          <Text style={s.footnote}>Notes to finish</Text>
        </Card>
      </View>
      <Card tint>
        <View style={s.between}>
          <Text style={s.eyebrow}>YOUR PRACTICE AT A GLANCE</Text>
          <Icon name="sunny-outline" color={c.teal} />
        </View>
        <Text style={[s.rowTitle, { fontSize: 22, lineHeight: 29 }]}>
          Make room for what matters.
        </Text>
        <Text style={s.body}>
          Your schedule, patient progress, and conversations. Together in one calmer place.
        </Text>
      </Card>
      <Section title="Coming up" action="Calendar" onPress={() => go('/activity')} />
      <Text style={s.footnote}>Monday, October 26 · sample day · Pacific time</Text>
      {[...demoAppointments]
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .slice(0, 2)
        .map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      <Section title="Needs your attention" />
      <Card>
        <Row
          title="Finish clinical progress notes"
          subtitle="2 sample drafts are ready for your review"
          icon="document-text-outline"
          onPress={() => feature('clinical-notes')}
        />
        <View style={s.divider} />
        <Row
          title="A message from your caseload"
          subtitle="Open the synthetic conversation"
          icon="chatbubble-ellipses-outline"
          onPress={() => go('/messages')}
        />
      </Card>
    </Screen>
  );
}
export function ActivityScreen() {
  const { role } = useDemo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  if (role === 'therapist') {
    const calendarFilter = ['All', 'Telehealth', 'In person'].includes(filter) ? filter : 'All';
    const appointments = demoAppointments
      .filter(
        (item) =>
          calendarFilter === 'All' ||
          (calendarFilter === 'Telehealth'
            ? item.modality === 'telehealth'
            : item.modality === 'in_person'),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return (
      <Screen title="Your calendar" subtitle="One session at a time. All sample times are Pacific.">
        <Card>
          <View style={s.between}>
            <Text style={s.rowTitle}>October 2026</Text>
            <Icon name="calendar-outline" color={c.teal} />
          </View>
          <View style={local.week}>
            {['M|26', 'T|27', 'W|28', 'T|29', 'F|30'].map((day, i) => (
              <View key={day} style={[local.day, i === 0 && local.daySelected]}>
                <Text style={[local.dayLabel, i === 0 && { color: c.white }]}>
                  {day.split('|')[0]}
                </Text>
                <Text style={[local.dayNumber, i === 0 && { color: c.white }]}>
                  {day.split('|')[1]}
                </Text>
              </View>
            ))}
          </View>
          <Text style={s.footnote}>Sample agenda · Monday, October 26</Text>
        </Card>
        <Chips
          values={['All', 'Telehealth', 'In person']}
          selected={calendarFilter}
          onSelect={setFilter}
        />
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
        <Notice title="Scheduling is a preview">
          Creating appointments, calendar sync, reminders, and video calls will be connected in a
          later phase.
        </Notice>
      </Screen>
    );
  }
  const journeyFilter = ['All', 'Sessions', 'Resources'].includes(filter) ? filter : 'All';
  const events = demoJourney.filter(
    (item) =>
      item.patientId === demoPatient.id &&
      item.portalShared &&
      (journeyFilter === 'All' ||
        (journeyFilter === 'Sessions' ? item.type === 'session' : item.type === 'resource')) &&
      `${item.title} ${item.description} ${item.themes.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <Screen
      title="Your journey"
      subtitle="Small moments. Meaningful progress. A space to see how far you have come."
    >
      <Search
        value={search}
        onChangeText={setSearch}
        placeholder="Search sessions, themes, moments"
      />
      <Chips
        values={['All', 'Sessions', 'Resources']}
        selected={journeyFilter}
        onSelect={setFilter}
      />
      {events.map((event) => (
        <Card key={event.id}>
          <View style={s.between}>
            <Badge text={event.type} />
            <Text style={s.footnote}>{shortDate(event.occurredAt)}</Text>
          </View>
          <Text style={[s.rowTitle, { fontSize: 18 }]}>{event.title}</Text>
          <Text style={s.body}>{event.description}</Text>
          <View style={s.chips}>
            {event.themes.map((theme) => (
              <Badge key={theme} text={theme} neutral />
            ))}
          </View>
          <Button
            secondary
            title={event.type === 'session' ? 'View session' : 'Explore care plan'}
            onPress={() =>
              event.type === 'session'
                ? go(
                    `/session/${event.id === 'journey-demo-1' ? 'session-demo-1' : 'session-demo-2'}`,
                  )
                : go('/care')
            }
          />
        </Card>
      ))}
      {events.length === 0 && (
        <Empty title="No moments found" subtitle="Try a different theme or clear your search." />
      )}
      <Notice>Only clinician-approved items appear in this sample patient journey.</Notice>
    </Screen>
  );
}
export function CareScreen() {
  const { role } = useDemo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  if (role === 'patient')
    return (
      <Screen
        title="Your care plan"
        subtitle="Small, manageable steps. At a pace that feels right for you."
      >
        <Card tint>
          <Badge text="BUILDING A LITTLE MORE BALANCE" />
          <Text style={[s.rowTitle, { fontSize: 22, lineHeight: 30 }]}>
            Progress looks different every day.
          </Text>
          <Text style={s.body}>These shared goals are here to guide you, not grade you.</Text>
        </Card>
        <Section title="What you are working toward" />
        <GoalCards />
        <Section title="Your resources" />
        <ResourceCards />
        <Notice>
          Practice checkmarks are saved only in this local demo. They are not sent to a clinician.
        </Notice>
      </Screen>
    );
  const patients = demoPatients.filter(
    (patient) =>
      patient.displayName.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'All' || patient.status === filter.toLowerCase()),
  );
  return (
    <Screen title="Your patients" subtitle="The people at the heart of your practice.">
      <Search value={search} onChangeText={setSearch} placeholder="Search your sample caseload" />
      <Chips values={['All', 'Active', 'Paused']} selected={filter} onSelect={setFilter} />
      <Text style={s.footnote}>{patients.length} synthetic patients</Text>
      {patients.map((patient) => (
        <Pressable
          key={patient.id}
          accessibilityRole="button"
          accessibilityLabel={`Open ${patient.displayName}`}
          onPress={() => go(`/patient/${patient.id}`)}
        >
          <Card>
            <View style={s.horizontal}>
              <Avatar initials={patient.initials} />
              <View style={s.flex}>
                <Text style={s.rowTitle}>{patient.displayName}</Text>
                <Text style={s.rowSubtitle}>{patient.email}</Text>
              </View>
              <Icon name="chevron-forward" color={c.muted} size={18} />
            </View>
            <Badge text={patient.status} />
          </Card>
        </Pressable>
      ))}
      {patients.length === 0 && (
        <Empty
          title="No patients found"
          subtitle="Try another name or choose a different filter."
        />
      )}
    </Screen>
  );
}
export function MessagesScreen() {
  const { role, messages, sendMessage } = useDemo();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const submit = () => {
    const result = sendMessage(draft);
    setError(result ?? '');
    if (!result) {
      setDraft('');
      setNotice('Added to this local demo conversation. No message was delivered.');
    }
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
      <Screen title="A place to connect" subtitle="Your synthetic conversation.">
        <Card>
          <View style={s.horizontal}>
            <Avatar initials={role === 'therapist' ? 'AM' : 'MC'} />
            <View style={s.flex}>
              <Text style={s.rowTitle}>{role === 'therapist' ? 'Avery Morgan' : 'Maya Chen'}</Text>
              <Text style={s.rowSubtitle}>Usually responds in 1–2 business days</Text>
            </View>
            <Icon name="chatbubble-outline" color={c.teal} />
          </View>
        </Card>
        <Notice title="Local conversation preview">
          Messages here are synthetic and stay in memory. For an emergency, contact local emergency
          services. This inbox is not monitored.
        </Notice>
        <View style={{ gap: 12 }}>
          {messages.map((message) => {
            const mine = message.senderRole === role;
            return (
              <View key={message.id} style={[local.bubble, mine && local.bubbleMine]}>
                <Text style={[local.messageAuthor, mine && { color: c.white }]}>
                  {mine ? 'You' : message.senderRole === 'therapist' ? 'Maya Chen' : 'Avery Morgan'}
                </Text>
                <Text style={[s.body, mine && { color: c.white }]}>{message.content}</Text>
                <Text style={[s.footnote, mine && { color: c.white }]}>{message.time}</Text>
              </View>
            );
          })}
        </View>
        <Field
          label="Message"
          placeholder="Write a synthetic message…"
          multiline
          value={draft}
          onChangeText={(value) => {
            setDraft(value);
            setNotice('');
          }}
          maxLength={4000}
          style={{ height: 112 }}
        />
        {error && (
          <Text accessibilityRole="alert" style={{ color: c.danger }}>
            {error}
          </Text>
        )}
        {notice && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            {notice}
          </Text>
        )}
        <Button title="Add demo message" icon="send-outline" onPress={submit} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
const therapistMore: [string, string, IconName][] = [
  ['Session library', 'sessions', 'albums-outline'],
  ['Clinical progress notes', 'clinical-notes', 'document-text-outline'],
  ['Psychotherapy notes', 'psychotherapy-notes', 'lock-closed-outline'],
  ['Patient-facing updates', 'patient-updates', 'paper-plane-outline'],
  ['Treatment plans', 'treatment-plans', 'flag-outline'],
  ['Resources & exercises', 'resources', 'leaf-outline'],
  ['Intake & forms', 'forms', 'clipboard-outline'],
  ['Billing & payments', 'billing', 'card-outline'],
  ['Insurance & claims', 'insurance', 'receipt-outline'],
  ['Reports & analytics', 'reports', 'bar-chart-outline'],
  ['Team & permissions', 'team', 'people-outline'],
  ['Consent & privacy', 'privacy', 'shield-checkmark-outline'],
  ['Practice settings', 'settings', 'options-outline'],
  ['Data import & export', 'data', 'swap-horizontal-outline'],
  ['Notifications', 'notifications', 'notifications-outline'],
  ['Telehealth workspace', 'telehealth', 'videocam-outline'],
];
const patientMore: [string, string, IconName][] = [
  ['Appointments', 'appointments', 'calendar-outline'],
  ['Session library', 'sessions', 'albums-outline'],
  ['Bookmarks', 'bookmarks', 'bookmark-outline'],
  ['Private journal', 'journal', 'create-outline'],
  ['Shared resources', 'resources', 'leaf-outline'],
  ['Intake & consent forms', 'forms', 'clipboard-outline'],
  ['Billing & receipts', 'billing', 'receipt-outline'],
  ['Notifications', 'notifications', 'notifications-outline'],
  ['Privacy & account', 'privacy', 'shield-checkmark-outline'],
  ['Records-access requests', 'records', 'folder-open-outline'],
  ['Help & support', 'support', 'help-circle-outline'],
];
export function MoreScreen() {
  const { role, setRole } = useDemo();
  return (
    <Screen title="Your space" subtitle="Everything else, thoughtfully in reach.">
      <Card>
        <View style={s.horizontal}>
          <Avatar initials={role === 'therapist' ? 'MC' : 'AM'} large />
          <View>
            <Text style={s.rowTitle}>
              {role === 'therapist' ? demoTherapist.displayName : demoPatient.displayName}
            </Text>
            <Text style={s.rowSubtitle}>
              {role === 'therapist' ? 'Willow Therapy · Clinician' : 'Patient experience'}
            </Text>
            <Text style={s.footnote}>Synthetic demo identity</Text>
          </View>
        </View>
      </Card>
      <Section title="Explore the demo" />
      <Chips
        values={['Therapist', 'Patient']}
        selected={role === 'therapist' ? 'Therapist' : 'Patient'}
        onSelect={(value) => setRole(value === 'Therapist' ? 'therapist' : 'patient')}
      />
      <Notice>This changes the demo view. It does not sign you in or open any real records.</Notice>
      <Card>
        {(role === 'therapist' ? therapistMore : patientMore).map(
          ([title, slug, icon], i, items) => (
            <React.Fragment key={slug}>
              <Row
                title={title}
                icon={icon}
                onPress={() => (slug === 'journal' ? go('/journal') : feature(slug))}
              />
              {i < items.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ),
        )}
      </Card>
      <Section title="Account interfaces" />
      <Card>
        <Row title="Login & demo entry" icon="log-in-outline" onPress={() => go('/auth/login')} />
        <Row
          title="Create account"
          icon="person-add-outline"
          onPress={() => go('/auth/register')}
        />
        <Row
          title="Password & account recovery"
          icon="key-outline"
          onPress={() => go('/auth/reset')}
        />
      </Card>
    </Screen>
  );
}
export function PatientScreen({ id }: { id: string }) {
  const { role } = useDemo();
  const patient = demoPatients.find((item) => item.id === id);
  if (!patient || role !== 'therapist')
    return (
      <Screen detail title="Patient unavailable">
        <Empty
          title="Choose a sample patient"
          subtitle="Patient profiles are part of the therapist demo. Open Patients to choose a profile."
        />
      </Screen>
    );
  const appointments = demoAppointments.filter((item) => item.patientId === patient.id);
  const sessions = demoSessions.filter((item) => item.patientId === patient.id);
  return (
    <Screen
      detail
      title={patient.displayName}
      subtitle="Synthetic patient profile · Willow Therapy"
    >
      <Card>
        <View style={s.horizontal}>
          <Avatar initials={patient.initials} large />
          <View>
            <Badge text={patient.status} />
            <Text style={s.rowSubtitle}>{patient.email}</Text>
          </View>
        </View>
        <Text style={s.body}>Clinician: Maya Chen</Text>
      </Card>
      <Section title="Next appointment" />
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
      {appointments.length === 0 && (
        <Empty
          title="Nothing scheduled"
          subtitle="There are no sample appointments for this patient."
        />
      )}
      <Section title="Session history" />
      <Card>
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <Row
              key={session.id}
              title={session.title}
              subtitle={`${shortDate(session.startsAt)} · ${session.durationMinutes} min`}
              icon="albums-outline"
              onPress={() => go(`/session/${session.id}`)}
            />
          ))
        ) : (
          <Text style={s.body}>No sample sessions for this patient.</Text>
        )}
      </Card>
      {patient.id === demoPatient.id && (
        <>
          <Section title="Shared care goals" />
          <GoalCards />
          <Section title="Care workspace" />
          <Card>
            <Row
              title="Patient journey"
              icon="git-branch-outline"
              onPress={() => feature('journey')}
            />
            <Row
              title="Clinical progress notes"
              subtitle="Ordinary clinical record"
              icon="document-text-outline"
              onPress={() => feature('clinical-notes')}
            />
            <Row
              title="Psychotherapy notes"
              subtitle="Separately maintained author-only concept"
              icon="lock-closed-outline"
              onPress={() => feature('psychotherapy-notes')}
            />
            <Row
              title="Patient-facing updates"
              subtitle="Clinician-approved content"
              icon="paper-plane-outline"
              onPress={() => feature('patient-updates')}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
export function SessionScreen({ id }: { id: string }) {
  const { role } = useDemo();
  const session = demoSessions.find(
    (item) =>
      item.id === id &&
      (role === 'therapist' || (item.portalShared && item.patientId === demoPatient.id)),
  );
  if (!session)
    return (
      <Screen detail title="Session unavailable">
        <Empty
          title="No shared session found"
          subtitle="Choose a session from the sample journey or session library."
        />
      </Screen>
    );
  return (
    <Screen
      detail
      title={session.title}
      subtitle={`${shortDate(session.startsAt)} · ${session.durationMinutes} minutes · Maya Chen`}
    >
      <Card>
        <Badge text={session.portalShared ? 'Shared with patient' : 'Clinician view'} />
        <Text style={s.rowTitle}>Room to reflect</Text>
        <Text style={s.body}>
          This sample session explored noticing your needs, setting small boundaries, and responding
          to yourself with kindness.
        </Text>
        <View style={s.chips}>
          {session.themes.map((theme) => (
            <Badge key={theme} text={theme} neutral />
          ))}
        </View>
      </Card>
      <Section title="Patient-facing update" />
      <Card>
        <Text style={s.body}>
          {demoPatientUpdates.find((update) => update.sessionId === id)?.content ??
            'No patient-facing update has been approved for this sample session.'}
        </Text>
      </Card>
      <Section title="Recording & replay" />
      <Card>
        <View style={s.horizontal}>
          <View style={s.iconTile}>
            <Icon name="videocam-off-outline" color={c.teal} />
          </View>
          <View style={s.flex}>
            <Text style={s.rowTitle}>Recording is off</Text>
            <Text style={s.rowSubtitle}>No audio, video, or transcript is captured.</Text>
          </View>
        </View>
        <Button title="Replay unavailable in Phase 1" disabled onPress={() => {}} />
        <Text style={s.footnote}>
          Future recording requires explicit consent, authorization, retention policies, and
          clinician-controlled sharing.
        </Text>
      </Card>
      <Button secondary title="Explore transcript & bookmarks" onPress={() => feature('replay')} />
      {role === 'patient' && (
        <Button
          title="Write a private reflection"
          icon="create-outline"
          onPress={() => go('/journal')}
        />
      )}
    </Screen>
  );
}
export function JournalScreen() {
  const { role, journals, saveJournal } = useDemo();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const submit = () => {
    const result = saveJournal(title, content);
    setError(result ?? '');
    if (!result) {
      setTitle('');
      setContent('');
      setSaved(true);
    }
  };
  if (role !== 'patient')
    return (
      <Screen detail title="Private reflections">
        <Notice>
          Journals belong to the patient experience. Switch to the patient demo in More to write a
          synthetic reflection.
        </Notice>
      </Screen>
    );
  return (
    <Screen detail title="A moment for yourself" subtitle="What has been on your mind?">
      <Notice title="Patient-private journal concept">
        Reflections are separate from clinical notes and messages. In this demo they remain in local
        memory until reload. Use invented text only.
      </Notice>
      <Card>
        <Field
          label="A title for this moment"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setSaved(false);
          }}
          placeholder="Something I noticed…"
          maxLength={160}
        />
        <Field
          label="Your reflection"
          value={content}
          onChangeText={(value) => {
            setContent(value);
            setSaved(false);
          }}
          placeholder="There is no right way to begin."
          multiline
          maxLength={10000}
        />
        {error && (
          <Text accessibilityRole="alert" style={{ color: c.danger }}>
            {error}
          </Text>
        )}
        {saved && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            Reflection saved in this demo.
          </Text>
        )}
        <Button title="Save demo reflection" icon="checkmark-outline" onPress={submit} />
      </Card>
      <Section title="Your reflections" />
      {journals.length === 0 ? (
        <Empty
          title="A blank page, just for you"
          subtitle="Your saved synthetic reflections will appear here."
        />
      ) : (
        journals.map((entry) => (
          <Card key={entry.id}>
            <Text style={s.rowTitle}>{entry.title}</Text>
            <Text style={s.body}>{entry.content}</Text>
            <Text style={s.footnote}>Local demo reflection</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
export function AuthScreen({ mode }: { mode: string }) {
  const { setRole } = useDemo();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const register = mode === 'register';
  const recovery = mode === 'reset' || mode === 'recovery';
  return (
    <Screen
      detail
      title={
        register
          ? 'Create your account'
          : recovery
            ? 'A way back to your account'
            : 'Welcome to Patient Touch'
      }
      subtitle="Thoughtfully connected care."
    >
      <Notice title="Local synthetic demo">
        An authentication provider is not configured. These screens are interface previews. No
        account is created, password verified, or email sent.
      </Notice>
      <Card>
        {register && <Field label="Full name" placeholder="Your name" autoComplete="name" />}
        <Field
          label="Email"
          placeholder="name@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {!recovery && (
          <Field
            label="Password"
            placeholder="Interface preview only"
            secureTextEntry
            autoComplete={register ? 'new-password' : 'current-password'}
          />
        )}
        <Button
          title={
            recovery
              ? 'Preview recovery request'
              : register
                ? 'Preview account creation'
                : 'Preview sign in'
          }
          onPress={() =>
            setResult(
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? 'Preview complete. No account action or email delivery occurred.'
                : 'Enter a valid email address to preview this form.',
            )
          }
        />
        {result && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            {result}
          </Text>
        )}
        <Row title="Forgot your password?" icon="key-outline" onPress={() => go('/auth/reset')} />
        <Row
          title="Recover account access"
          icon="help-circle-outline"
          onPress={() => go('/auth/recovery')}
        />
      </Card>
      <Section title="Explore with synthetic data" />
      <Button
        title="Enter therapist demo"
        onPress={() => {
          setRole('therapist');
          router.replace('/');
        }}
      />
      <Button
        title="Enter patient demo"
        secondary
        onPress={() => {
          setRole('patient');
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const featureNames: Record<string, string> = {
  appointment: 'Your appointment',
  appointments: 'Appointments',
  sessions: 'Session library',
  journey: 'Patient journey',
  'clinical-notes': 'Clinical progress notes',
  'psychotherapy-notes': 'Psychotherapy notes',
  'patient-updates': 'Patient-facing updates',
  'treatment-plans': 'Treatment plans',
  resources: 'Resources & exercises',
  forms: 'Intake & consent',
  billing: 'Billing & receipts',
  insurance: 'Insurance & claims',
  reports: 'Practice reports',
  team: 'Team & permissions',
  privacy: 'Consent & privacy',
  settings: 'Practice settings',
  data: 'Import & export',
  notifications: 'Notifications',
  telehealth: 'Telehealth workspace',
  bookmarks: 'Your bookmarks',
  records: 'Records-access requests',
  support: 'Help & support',
  replay: 'Replay & transcript',
};
export function FeatureScreen({ slug, appointmentId }: { slug: string; appointmentId?: string }) {
  const { role } = useDemo();
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState('');
  const title = featureNames[slug] ?? 'Workspace preview';
  if (
    role === 'patient' &&
    [
      'clinical-notes',
      'psychotherapy-notes',
      'patient-updates',
      'journey',
      'team',
      'reports',
      'insurance',
      'settings',
      'data',
      'telehealth',
    ].includes(slug)
  )
    return (
      <Screen detail title="Therapist workspace">
        <Notice>
          This page belongs to the therapist demo. Return to More to explore the patient experience.
        </Notice>
      </Screen>
    );
  let content: React.ReactNode;
  switch (slug) {
    case 'appointment':
    case 'appointments':
      content = (
        <>
          <AppointmentCard
            appointment={
              demoAppointments.find(
                (item) =>
                  item.id === appointmentId &&
                  (role === 'therapist' || item.patientId === demoPatient.id),
              ) ?? nextAppointment
            }
            compact
          />
          <Notice title="Telehealth is not connected">
            No video call or reminder will start. Appointment changes and cancellations are
            unavailable in Phase 1.
          </Notice>
          <Button
            disabled
            title="Join video · unavailable"
            icon="videocam-outline"
            onPress={() => {}}
          />
        </>
      );
      break;
    case 'sessions':
      content = (
        <>
          <Search value={filter} onChangeText={setFilter} placeholder="Search sample sessions" />
          <Card>
            {demoSessions
              .filter(
                (item) =>
                  (role === 'therapist' ||
                    (item.portalShared && item.patientId === demoPatient.id)) &&
                  item.title.toLowerCase().includes(filter.toLowerCase()),
              )
              .map((session) => (
                <Row
                  key={session.id}
                  title={session.title}
                  subtitle={`${shortDate(session.startsAt)} · 50 minutes`}
                  icon="albums-outline"
                  onPress={() => go(`/session/${session.id}`)}
                />
              ))}
          </Card>
        </>
      );
      break;
    case 'journey':
      content = (
        <>
          {demoJourney.map((event) => (
            <Card key={event.id}>
              <Badge text={event.type} />
              <Text style={s.rowTitle}>{event.title}</Text>
              <Text style={s.body}>{event.description}</Text>
              <Text style={s.footnote}>
                {shortDate(event.occurredAt)} · clinician-approved portal item
              </Text>
            </Card>
          ))}
        </>
      );
      break;
    case 'resources':
      content = (
        <>
          <Notice>
            These are synthetic assignments. Completion checkmarks are local to this demo.
          </Notice>
          <ResourceCards />
        </>
      );
      break;
    case 'treatment-plans':
      content = (
        <>
          <Card tint>
            <Text style={s.rowTitle}>Building a little more balance</Text>
            <Text style={s.body}>
              An active sample plan with three goals shared with the patient.
            </Text>
          </Card>
          <GoalCards />
        </>
      );
      break;
    case 'patient-updates':
      content = (
        <>
          {demoPatientUpdates
            .filter(
              (update) =>
                update.approvedAt && (role === 'therapist' || update.patientId === demoPatient.id),
            )
            .map((update) => (
              <Card key={update.id}>
                <Badge text="Clinician approved" />
                <Text style={s.rowTitle}>{update.title}</Text>
                <Text style={s.body}>{update.content}</Text>
              </Card>
            ))}
          <Notice>
            Patient-facing updates are separate from clinical progress notes and psychotherapy
            notes.
          </Notice>
        </>
      );
      break;
    case 'clinical-notes':
      content = (
        <>
          <Card>
            <Badge text="Clinical record concept" />
            <Text style={s.rowTitle}>Ordinary clinical progress notes</Text>
            <Text style={s.body}>
              A dedicated place for session documentation, clinician signatures, and amendments to
              the ordinary clinical record.
            </Text>
            <Row
              title="2 sample drafts awaiting review"
              subtitle="No real note content is stored in Phase 1"
              icon="document-text-outline"
            />
          </Card>
          <Notice>Saving, signing, and amending notes are unavailable in this local demo.</Notice>
        </>
      );
      break;
    case 'psychotherapy-notes':
      content = (
        <>
          <Card>
            <Icon name="lock-closed-outline" size={32} color={c.teal} />
            <Text style={s.rowTitle}>A separately maintained workspace</Text>
            <Text style={s.body}>
              A distinct place for a clinician’s separately maintained psychotherapy notes. These
              are excluded from routine patient portal sharing, clinical progress notes, and
              patient-facing updates.
            </Text>
          </Card>
          <Notice>
            No psychotherapy notes are stored in this demo. Restricted note access must be
            configured before this workspace can be used.
          </Notice>
        </>
      );
      break;
    case 'forms':
      content = (
        <>
          {demoForms.map((form) => (
            <Card key={form.id}>
              <Badge text={form.status.replaceAll('_', ' ')} />
              <Text style={s.rowTitle}>{form.title}</Text>
              <Text style={s.body}>
                A sample intake form. Form completion and legally valid consent capture are not
                enabled.
              </Text>
            </Card>
          ))}
          <Notice title="Recording consent">
            Recording is off by default. No recording consent has been requested or granted in this
            demo.
          </Notice>
        </>
      );
      break;
    case 'billing':
      content = (
        <>
          {demoInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <View style={s.between}>
                <Badge text={invoice.status} />
                <Text style={s.rowTitle}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: invoice.currency,
                  }).format(invoice.amountCents / 100)}
                </Text>
              </View>
              <Text style={s.rowTitle}>{invoice.description}</Text>
              <Text style={s.footnote}>Synthetic receipt · no payment processed</Text>
            </Card>
          ))}
          <Notice>
            No payment provider is connected. Payment collection and receipt downloads are
            unavailable.
          </Notice>
        </>
      );
      break;
    case 'notifications':
      content = (
        <>
          {demoNotifications.map((notification) => (
            <Card key={notification.id}>
              <Row
                title={notification.title}
                subtitle={notification.description}
                icon="notifications-outline"
              />
            </Card>
          ))}
          <Notice>Push notifications and email delivery are disabled.</Notice>
        </>
      );
      break;
    case 'privacy':
      content = (
        <>
          <Card>
            <Row
              title="Recording"
              subtitle="Off by default · no recording exists"
              icon="videocam-off-outline"
            />
            <View style={s.divider} />
            <Row
              title="Patient journal"
              subtitle="A space for the patient’s own reflections"
              icon="create-outline"
            />
            <View style={s.divider} />
            <Row
              title="Portal sharing"
              subtitle="Clinician-approved updates and shared goals"
              icon="eye-outline"
            />
          </Card>
          <Notice>
            This local demo does not save privacy preferences, capture consent, or change access to
            records.
          </Notice>
        </>
      );
      break;
    case 'records':
      content = (
        <>
          <Card>
            <Icon name="folder-open-outline" color={c.teal} size={32} />
            <Text style={s.rowTitle}>Access to your care records</Text>
            <Text style={s.body}>
              Future requests will support identity verification, clinical record scope, review,
              response tracking, and an auditable fulfillment process.
            </Text>
            <Button
              title="Preview request"
              secondary
              onPress={() => setNotice('Request preview only. No records request was submitted.')}
            />
          </Card>
        </>
      );
      break;
    case 'replay':
    case 'bookmarks':
      content = (
        <>
          <Empty
            title="A space for session moments"
            subtitle="No recording or transcript exists in this phase. Replay, timecoded transcripts, and bookmarks will become available only after recording and access controls are implemented."
          />
          <Button disabled title="Playback unavailable" onPress={() => {}} />
        </>
      );
      break;
    case 'telehealth':
      content = (
        <>
          <Card>
            <Icon name="videocam-off-outline" size={36} color={c.teal} />
            <Text style={s.rowTitle}>Your future session workspace</Text>
            <Text style={s.body}>
              The shell is ready for an authorized provider. Calls, recording, and participant links
              are disabled.
            </Text>
          </Card>
          <Button disabled title="Start call · unavailable" onPress={() => {}} />
        </>
      );
      break;
    case 'support':
      content = (
        <>
          <Card>
            <Row
              title="Using the demo"
              subtitle="Explore both roles in More. Use invented information only."
              icon="help-circle-outline"
            />
            <Row
              title="Data stays local"
              subtitle="Demo changes reset when this app reloads."
              icon="flask-outline"
            />
          </Card>
          <Notice title="Need urgent help?">
            This app is not an emergency service. Contact local emergency services if you are in
            immediate danger.
          </Notice>
        </>
      );
      break;
    case 'team':
      content = (
        <>
          <Card>
            {[
              'Practice Owner',
              'Practice Administrator',
              'Therapist / Clinician',
              'Billing Staff',
              'Patient',
            ].map((item) => (
              <Row
                key={item}
                title={item}
                subtitle="Supported shared authorization role"
                icon="person-outline"
              />
            ))}
          </Card>
          <Notice>
            Team invitations and permission changes are unavailable. This role preview grants no
            access to real records.
          </Notice>
        </>
      );
      break;
    case 'reports':
      content = (
        <>
          <View style={local.stats}>
            <Card style={local.stat}>
              <Text style={s.bigNumber}>3</Text>
              <Text style={s.footnote}>Sample sessions</Text>
            </Card>
            <Card style={local.stat}>
              <Text style={s.bigNumber}>4</Text>
              <Text style={s.footnote}>Sample patients</Text>
            </Card>
          </View>
          <Notice>
            Reporting queries and downloadable analytics are not connected to a database.
          </Notice>
        </>
      );
      break;
    default:
      content = (
        <>
          <Card>
            <Icon
              name={
                slug === 'insurance'
                  ? 'receipt-outline'
                  : slug === 'data'
                    ? 'swap-horizontal-outline'
                    : 'options-outline'
              }
              size={34}
              color={c.teal}
            />
            <Text style={s.rowTitle}>{title}</Text>
            <Text style={s.body}>
              {slug === 'insurance'
                ? 'A place for payer details, claim status, and your billing team’s work.'
                : slug === 'data'
                  ? 'A place to bring practice data in and prepare authorized record exports, with a history of sensitive actions.'
                  : 'A place for your practice preferences, team access, and connected services.'}
            </Text>
            <Badge text="Phase 1 interface" />
          </Card>
          <Notice>
            Connected services and saved changes are not available in this synthetic demo.
          </Notice>
        </>
      );
  }
  return (
    <Screen detail title={title} subtitle="Thoughtfully connected care · synthetic preview">
      {content}
      {notice && <Notice>{notice}</Notice>}
    </Screen>
  );
}
const local = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, padding: 14, gap: 5 },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    gap: 9,
    borderRadius: 15,
    backgroundColor: c.background,
  },
  daySelected: { backgroundColor: c.teal },
  dayLabel: { color: c.secondary, fontSize: 12, fontWeight: '500' },
  dayNumber: { color: c.navy, fontSize: 19, fontWeight: '700' },
  bubble: {
    padding: 17,
    gap: 8,
    backgroundColor: c.white,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    alignSelf: 'flex-start',
    maxWidth: '91%',
    borderWidth: 1,
    borderColor: c.border,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: c.teal,
    borderColor: c.teal,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 5,
  },
  messageAuthor: { fontSize: 12, color: c.teal, fontWeight: '700' },
});
