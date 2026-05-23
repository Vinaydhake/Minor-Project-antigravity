import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../lib/format';

export function GlassCard({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('glass-card rounded-[28px] p-5 md:p-6', className)}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/80">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-300">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'green' | 'sky' | 'orange' | 'violet';
}) {
  const tones: Record<typeof tone, string> = {
    default: 'from-white/8 to-white/5 text-white',
    green: 'from-green-500/20 to-green-500/5 text-green-200',
    sky: 'from-sky-500/20 to-sky-500/5 text-sky-200',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-200',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-200',
  };

  return (
    <div className={cn('rounded-3xl border border-white/10 bg-gradient-to-br p-4', tones[tone])}>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

export function Badge({
  children,
  tone = 'default',
}: PropsWithChildren<{ tone?: 'default' | 'green' | 'orange' | 'violet' | 'red' | 'sky' }>) {
  const tones: Record<typeof tone, string> = {
    default: 'border-white/10 bg-white/5 text-slate-200',
    green: 'border-green-400/25 bg-green-500/10 text-green-200',
    orange: 'border-orange-400/25 bg-orange-500/10 text-orange-200',
    violet: 'border-violet-400/25 bg-violet-500/10 text-violet-200',
    red: 'border-red-400/25 bg-red-500/10 text-red-200',
    sky: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
  };

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function LoadingState({ label = 'Loading EarthPulse data...' }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <GlassCard className="flex max-w-md items-center gap-4">
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-gradient-to-br from-sky-500/40 to-violet-500/30" />
        <div>
          <div className="font-display text-lg text-white">Syncing dashboards</div>
          <div className="text-sm text-slate-400">{label}</div>
        </div>
      </GlassCard>
    </div>
  );
}

export function ErrorState({
  title = 'Something went off course',
  description,
  actionLabel,
  onAction,
}: {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <GlassCard className="mx-auto max-w-xl">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-red-200">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
