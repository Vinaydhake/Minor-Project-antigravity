import { Link } from 'wouter';
import { ErrorState } from '../components/ui';

export function NotFoundPage() {
  return (
    <ErrorState
      title="Page not found"
      description="That route doesn’t exist in EarthPulse yet. Use the link below to return to the globe explorer."
      actionLabel="Return to globe"
      onAction={() => {
        window.location.href = '/';
      }}
    />
  );
}
