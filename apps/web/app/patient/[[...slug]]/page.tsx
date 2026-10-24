import { notFound, redirect } from 'next/navigation';
import { Workspace } from '../../../components/workspace';
import { patientRoutes } from '../../../lib/routes';
import { demoSessions } from '@patient-touch/types/demo';
const slugs = [
  ...patientRoutes.map((r) => r.slug),
  ...demoSessions
    .filter((s) => s.portalShared)
    .flatMap((s) => [`sessions/${s.id}`, `sessions/${s.id}/replay`]),
];
export function generateStaticParams() {
  return slugs.map((slug) => ({ slug: slug.split('/') }));
}
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  if (!slug) redirect('/patient/home');
  const path = slug.join('/');
  if (!slugs.includes(path)) notFound();
  return <Workspace key={path} role="patient" slug={path} />;
}
