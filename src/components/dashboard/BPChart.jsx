import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

export default function BPChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-5 border shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Andamento Pressione</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nessun dato disponibile
        </p>
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-14)
    .map(d => ({
      date: format(new Date(d.created_date), 'dd/MM'),
      sistolica: d.systolic,
      diastolica: d.diastolic,
      bpm: d.heart_rate,
    }));

  return (
    <div className="bg-card rounded-2xl p-5 border shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Andamento Pressione</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sysFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="diaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 180]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: 12, border: '1px solid hsl(214, 20%, 90%)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="sistolica" stroke="hsl(199, 89%, 48%)" fill="url(#sysFill)" strokeWidth={2} dot={{ r: 3 }} />
            <Area type="monotone" dataKey="diastolica" stroke="hsl(168, 76%, 42%)" fill="url(#diaFill)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 justify-center">
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
  );
}