import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">A LITTLE OFF THE PATH</span>
      <h1>Let’s find your way back.</h1>
      <p>This page isn’t part of the Patient Touch preview.</p>
      <Link href="/therapist/today" className="pt-button pt-button--primary">
        Return to your workspace
      </Link>
    </main>
  );
}
