'use client';
import { ErrorState } from '@patient-touch/ui';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-page">
      <ErrorState
        message="The preview could not load. Try again to return to your synthetic workspace."
        onRetry={reset}
      />
    </div>
  );
}
