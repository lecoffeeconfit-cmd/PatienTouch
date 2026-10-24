import { useLocalSearchParams } from 'expo-router';
import { AuthScreen } from '../../src/screens';
export default function AuthRoute() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  return <AuthScreen mode={mode} />;
}

export function generateStaticParams() {
  return ['login', 'register', 'reset', 'recovery'].map((mode) => ({ mode }));
}
