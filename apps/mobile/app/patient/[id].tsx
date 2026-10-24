import { demoPatients } from '@patient-touch/types/demo';
import { useLocalSearchParams } from 'expo-router';
import { PatientScreen } from '../../src/screens';
export default function PatientRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PatientScreen id={id} />;
}

export function generateStaticParams() {
  return demoPatients.map((item) => ({ id: item.id }));
}
