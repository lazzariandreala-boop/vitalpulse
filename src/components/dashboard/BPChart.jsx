import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl px-3 py-2 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BPChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-2xl border shadow-sm p-5">
        <h3 className="text-sm font-semibold mb-1">Andamento Pressione</h3>
        <p className="text-xs text-muted-foreground mb-6">Ultimi 14 rilevamenti</p>
        <p className="text-sm text-muted-foreground text-center py-10">Nessun dato disponibile</p>
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-14)
    .map(d => ({
      date: format(new Date(d.created_date), 'dd/MM'),
      Sistolica: d.systolic,
      Diastolica: d.diastolic,
    }));

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold">Andamento Pressione</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Ultimi 14 rilevamenti</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Sistolica</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Diastolica</span>
          </div>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gSys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(199,89%,48%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(199,89%,48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gDia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(168,76%,42%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(168,76%,42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 180]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="Sistolica"  stroke="hsl(199,89%,48%)" fill="url(#gSys)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(199,89%,48%)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="Diastolica" stroke="hsl(168,76%,42%)" fill="url(#gDia)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(168,76%,42%)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
