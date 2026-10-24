import { router } from 'expo-router';
import { Button, Empty, Screen } from '../src/ui';
export default function NotFoundScreen() {
  return (
    <Screen detail title="A little detour">
      <Empty
        title="This page is not here"
        subtitle="Return to your Patient Touch demo to continue."
      />
      <Button title="Go to home" onPress={() => router.replace('/')} />
    </Screen>
  );
}
