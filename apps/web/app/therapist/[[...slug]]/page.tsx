import { notFound, redirect } from 'next/navigation';
import { Workspace } from '../../../components/workspace';
import { therapistRoutes } from '../../../lib/routes';
import { demoPatients, demoSessions } from '@patient-touch/types/demo';
const slugs = [
  ...therapistRoutes.map((r) => r.slug),
  ...demoPatients.map((p) => `patients/${p.id}`),
  ...demoSessions.map((s) => `sessions/${s.id}`),
];
export function generateStaticParams() {
  return slugs.map((slug) => ({ slug: slug.split('/') }));
}
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  if (!slug) redirect('/therapist/today');
  const path = slug.join('/');
  if (!slugs.includes(path)) notFound();
  return <Workspace key={path} role="therapist" slug={path} />;
}
