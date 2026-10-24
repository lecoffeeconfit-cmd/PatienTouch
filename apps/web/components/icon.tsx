import {
  Home,
  CalendarDays,
  UsersRound,
  Waypoints,
  PanelsTopLeft,
  MessageSquare,
  BookOpen,
  FileText,
  LockKeyhole,
  Sparkles,
  Target,
  Video,
  ClipboardList,
  CreditCard,
  ShieldCheck,
  ChartNoAxesCombined,
  Settings,
  Download,
  Bell,
  CircleHelp,
  Bookmark,
  type LucideProps,
} from 'lucide-react';
const icons = {
  home: Home,
  calendar: CalendarDays,
  users: UsersRound,
  journey: Waypoints,
  sessions: PanelsTopLeft,
  message: MessageSquare,
  book: BookOpen,
  notes: FileText,
  lock: LockKeyhole,
  sparkles: Sparkles,
  target: Target,
  video: Video,
  forms: ClipboardList,
  billing: CreditCard,
  shield: ShieldCheck,
  chart: ChartNoAxesCombined,
  settings: Settings,
  download: Download,
  bell: Bell,
  help: CircleHelp,
  bookmark: Bookmark,
};
export function Icon({ name, ...props }: LucideProps & { name: string }) {
  const Component = icons[name as keyof typeof icons] || Home;
  return <Component size={19} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M16 27V14M16 19C6 20 4 12 5 6c8 0 12 5 11 13ZM16 24C25 24 29 17 27 10c-7 1-12 6-11 14Z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span>
          patient<span className="brand-light">touch</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </span>
  );
}
