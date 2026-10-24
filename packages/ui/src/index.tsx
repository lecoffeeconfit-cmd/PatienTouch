'use client';
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return <button className={`pt-button pt-button--${variant} ${className}`} {...props} />;
}
export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`pt-card ${className}`} {...props}>
      {children}
    </section>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'teal' | 'amber';
}) {
  return <span className={`pt-badge pt-badge--${tone}`}>{children}</span>;
}
export function Input({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId();
  return (
    <label className="pt-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <small id={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
export function Tabs({
  items,
  value,
  onChange,
  label = 'View',
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div className="pt-tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button key={item} aria-pressed={value === item} onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}
export function Modal({
  title,
  children,
  open,
  onClose,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="pt-dialog"
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      onClose={onClose}
    >
      <div className="pt-dialog-header">
        <h2 id={id}>{title}</h2>
        <Button variant="ghost" aria-label="Close dialog" onClick={onClose}>
          ✕
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p>{description}</p>
      <div className="pt-dialog-actions">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="pt-empty">
      <div className="pt-empty-symbol" aria-hidden="true">
        ○
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function LoadingState({ label = 'Loading your workspace' }: { label?: string }) {
  return (
    <div className="pt-loading" role="status">
      <span className="pt-spinner" />
      {label}
    </div>
  );
}
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="pt-error">
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function SearchBar({
  label = 'Search',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string }) {
  return (
    <div className="pt-search">
      <span aria-hidden="true">⌕</span>
      <input type="search" aria-label={label} placeholder={label} {...props} />
    </div>
  );
}
export function Table({
  headings,
  children,
  label,
}: {
  headings: string[];
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="pt-table-wrap">
      <table>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th scope="col" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
