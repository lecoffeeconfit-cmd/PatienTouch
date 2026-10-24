import { useLocalSearchParams } from 'expo-router';
import { FeatureScreen } from '../../src/screens';
export default function FeatureRoute() {
  const { slug, appointmentId } = useLocalSearchParams<{ slug: string; appointmentId?: string }>();
  return <FeatureScreen slug={slug} appointmentId={appointmentId} />;
}

export function generateStaticParams() {
  return [
    'appointment',
    'appointments',
    'sessions',
    'journey',
    'clinical-notes',
    'psychotherapy-notes',
    'patient-updates',
    'treatment-plans',
    'resources',
    'forms',
    'billing',
    'insurance',
    'reports',
    'team',
    'privacy',
    'settings',
    'data',
    'notifications',
    'telehealth',
    'bookmarks',
    'records',
    'support',
    'replay',
  ].map((slug) => ({ slug }));
}
