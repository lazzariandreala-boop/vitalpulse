import { cn } from '@/lib/utils';

export default function StatCard({ icon: Icon, label, value, unit, trend, color = "primary" }) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive",
    chart3: "bg-purple-100 text-purple-600",
    chart4: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="bg-card rounded-2xl p-4 border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">
          {value ?? '—'}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}