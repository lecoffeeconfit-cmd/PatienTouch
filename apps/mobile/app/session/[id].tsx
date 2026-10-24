import { demoSessions } from '@patient-touch/types/demo';
import { useLocalSearchParams } from 'expo-router';
import { SessionScreen } from '../../src/screens';
export default function SessionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionScreen id={id} />;
}

export function generateStaticParams() {
  return demoSessions.map((item) => ({ id: item.id }));
}
