'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button, Input, Badge } from '@patient-touch/ui';
import { loginSchema, registrationSchema, passwordResetSchema } from '@patient-touch/schemas';
import { Brand, Icon } from './icon';
export function AuthScreen({
  kind,
}: {
  kind: 'login' | 'register' | 'forgot-password' | 'recover-account';
}) {
  const [role, setRole] = useState('therapist');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const register = kind === 'register';
  const recover = kind === 'recover-account';
  const reset = kind === 'forgot-password';
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="eyebrow">CARE BEYOND THE SESSION</span>
          <h1>
            More connection.
            <br />
            More room to grow.
          </h1>
          <p>
            A thoughtful space for your practice, your patients, and the progress you make together.
          </p>
          <div className="auth-features">
            <span>
              <Icon name="calendar" />A calmer practice day
            </span>
            <span>
              <Icon name="journey" />A connected patient journey
            </span>
            <span>
              <Icon name="book" />
              Support between sessions
            </span>
          </div>
        </div>
        <span className="auth-story-footer">Thoughtful care. Lasting connection.</span>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form">
          <Badge tone="teal">Phase 1 · Synthetic demo</Badge>
          <h2>
            {register
              ? 'A thoughtful beginning.'
              : recover
                ? 'Find your way back.'
                : reset
                  ? 'A fresh start.'
                  : 'Welcome to Patient Touch.'}
          </h2>
          <p>
            {register
              ? 'Explore the account creation interface.'
              : recover
                ? 'Account recovery will connect to your verified authentication provider.'
                : reset
                  ? 'Explore the password reset interface.'
                  : 'Your care, connected. Explore a space designed with you in mind.'}
          </p>
          <div className="auth-demo-note">
            <Icon name="help" size={18} />
            <span>
              No production authentication is configured. Use the demo buttons below. Do not enter a
              real password or patient information.
            </span>
          </div>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const parsed = register
                ? registrationSchema.safeParse({
                    displayName: data.get('name'),
                    email: data.get('email'),
                    password: data.get('password'),
                    acceptTerms: data.get('terms') === 'on',
                  })
                : reset || recover
                  ? passwordResetSchema.safeParse({ email: data.get('email') })
                  : loginSchema.safeParse({
                      email: data.get('email'),
                      password: data.get('password'),
                    });
              if (!parsed.success) {
                setError(parsed.error.issues[0].message);
                setMessage('');
                return;
              }
              setError('');
              setMessage(
                'Interface preview complete. No account was created, authenticated, recovered, or emailed. Use a synthetic demo view to explore.',
              );
            }}
          >
            {register && (
              <Input
                label="Sample full name"
                name="name"
                placeholder="Avery Morgan"
                required
                maxLength={120}
              />
            )}
            <Input
              label="Sample email"
              name="email"
              type="email"
              placeholder="avery@example.invalid"
              required
            />
            {!reset && !recover && (
              <Input
                label="Sample password"
                name="password"
                type="password"
                autoComplete="off"
                placeholder={register ? 'At least 12 sample characters' : 'A sample password only'}
                required
                minLength={register ? 12 : 1}
                maxLength={256}
              />
            )}
            {register && (
              <label className="checkbox-label">
                <input type="checkbox" name="terms" required />I understand this is a synthetic
                account creation preview.
              </label>
            )}
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="success-text" role="status">
                {message}
              </p>
            )}
            <Button type="submit">
              {register
                ? 'Preview account creation'
                : reset
                  ? 'Preview reset request'
                  : recover
                    ? 'Preview recovery request'
                    : 'Preview sign in'}
              <ArrowRight size={16} />
            </Button>
          </form>
          {kind === 'login' && (
            <Link href="/forgot-password" className="auth-small-link">
              Forgot password?
            </Link>
          )}
          <div className="auth-separator">
            <span>EXPLORE WITH SAMPLE DATA</span>
          </div>
          <div className="demo-role-picker">
            <button aria-pressed={role === 'therapist'} onClick={() => setRole('therapist')}>
              <Icon name="users" />
              Therapist
            </button>
            <button aria-pressed={role === 'patient'} onClick={() => setRole('patient')}>
              <Icon name="journey" />
              Patient
            </button>
          </div>
          <Link
            href={role === 'therapist' ? '/therapist/today' : '/patient/home'}
            className="pt-button pt-button--secondary full-width"
          >
            Enter {role} demo
            <ArrowRight size={17} />
          </Link>
          <p className="auth-bottom">
            {register ? 'Already exploring?' : 'New to Patient Touch?'}{' '}
            <Link href={register ? '/login' : '/register'}>
              {register ? 'Back to sign in' : 'Explore registration'}
            </Link>
          </p>
          {(reset || recover) && (
            <Link className="auth-small-link" href="/login">
              Return to sign in
            </Link>
          )}
          {kind === 'login' && (
            <Link className="auth-small-link" href="/recover-account">
              Need account recovery?
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
