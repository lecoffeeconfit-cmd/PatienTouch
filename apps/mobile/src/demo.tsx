import React, { createContext, useContext, useState } from 'react';
import { demoMessages, demoResources } from '@patient-touch/types/demo';
import { journalEntrySchema, messageSchema } from '@patient-touch/schemas';

export type DemoRole = 'therapist' | 'patient';
type JournalEntry = { id: string; title: string; content: string; createdAt: string };
type LocalMessage = { id: string; content: string; senderRole: DemoRole; time: string };
type DemoState = {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  messages: LocalMessage[];
  sendMessage: (content: string) => string | undefined;
  journals: JournalEntry[];
  saveJournal: (title: string, content: string) => string | undefined;
  completedResources: string[];
  toggleResource: (id: string) => void;
};
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<DemoRole>('therapist');
  const [messages, setMessages] = useState<LocalMessage[]>(() =>
    demoMessages.map((message) => ({
      id: message.id,
      content: message.content,
      senderRole: 'therapist' as const,
      time: 'Demo conversation',
    })),
  );
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [completedResources, setCompletedResources] = useState<string[]>(() =>
    demoResources.filter((r) => r.status === 'completed').map((r) => r.id),
  );
  const sendMessage = (content: string) => {
    const parsed = messageSchema.safeParse({ content });
    if (!parsed.success) return 'Write a message between 1 and 4,000 characters.';
    setMessages((items) => [
      ...items,
      {
        id: `local-${Date.now()}`,
        content: parsed.data.content,
        senderRole: role,
        time: 'Just now · local demo',
      },
    ]);
  };
  const saveJournal = (title: string, content: string) => {
    const parsed = journalEntrySchema.safeParse({ title, content });
    if (!parsed.success)
      return 'Add a title and reflection. Keep the title under 160 characters and the reflection under 10,000.';
    setJournals((items) => [
      { id: `journal-${Date.now()}`, ...parsed.data, createdAt: new Date().toISOString() },
      ...items,
    ]);
  };
  const toggleResource = (id: string) =>
    setCompletedResources((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  return (
    <DemoContext.Provider
      value={{
        role,
        setRole,
        messages,
        sendMessage,
        journals,
        saveJournal,
        completedResources,
        toggleResource,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('DemoProvider is required');
  return value;
}
