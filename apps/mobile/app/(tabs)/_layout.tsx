import { Tabs } from 'expo-router';
import { useDemo } from '../../src/demo';
import { c, Icon } from '../../src/ui';

export default function TabLayout() {
  const { role } = useDemo();
  const therapist = role === 'therapist';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.teal,
        tabBarInactiveTintColor: c.secondary,
        tabBarStyle: { backgroundColor: c.white, borderTopColor: c.border, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: therapist ? 'Today' : 'Home',
          tabBarIcon: ({ color }) => (
            <Icon name={therapist ? 'sunny-outline' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: therapist ? 'Calendar' : 'My Journey',
          tabBarIcon: ({ color }) => (
            <Icon name={therapist ? 'calendar-outline' : 'git-branch-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: therapist ? 'Patients' : 'Care Plan',
          tabBarIcon: ({ color }) => (
            <Icon name={therapist ? 'people-outline' : 'leaf-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Icon name="chatbubbles-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Icon name="grid-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
