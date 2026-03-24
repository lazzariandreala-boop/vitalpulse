import { cn } from '@/lib/utils';

const colorConfig = {
  primary:     { icon: 'bg-primary/20 text-primary',         bar: 'from-primary/40 to-primary/10',         glow: 'shadow-primary/10' },
  accent:      { icon: 'bg-accent/20 text-accent',           bar: 'from-accent/40 to-accent/10',           glow: 'shadow-accent/10' },
  destructive: { icon: 'bg-red-500/15 text-red-400',         bar: 'from-red-500/40 to-red-500/10',         glow: 'shadow-red-500/10' },
  chart3:      { icon: 'bg-purple-500/15 text-purple-400',   bar: 'from-purple-500/40 to-purple-500/10',   glow: 'shadow-purple-500/10' },
  chart4:      { icon: 'bg-amber-500/15 text-amber-400',     bar: 'from-amber-500/40 to-amber-500/10',     glow: 'shadow-amber-500/10' },
};

export default function StatCard({ icon: Icon, label, value, unit, trend, color = 'primary' }) {
  const cfg = colorConfig[color] || colorConfig.primary;

  return (
    <div className={cn(
      'relative bg-card rounded-2xl border overflow-hidden',
      'shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5',
    )}>
      {/* top gradient bar */}
      <div className={cn('h-1 w-full bg-gradient-to-r', cfg.bar)} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2.5 rounded-xl', cfg.icon)}>
            <Icon className="w-5 h-5" />
          </div>
          {trend != null && (
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              trend > 0 ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>

        <p className="text-2xl font-bold tracking-tight leading-none">
          {value ?? '—'}
          {value != null && unit && (
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  );
}
