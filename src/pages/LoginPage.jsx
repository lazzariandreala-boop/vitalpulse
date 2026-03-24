import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    login(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">VitalPulse</h1>
            <p className="text-sm text-muted-foreground mt-1">Il tuo diario della salute personale</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-lg">Crea il tuo profilo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inserisci il tuo nome per iniziare. I dati restano sul tuo dispositivo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs">Nome completo *</Label>
              <Input
                placeholder="Es. Mario Rossi"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                autoFocus
                required
              />
            </div>

            <div>
              <Label className="text-xs">Email <span className="text-muted-foreground">(opzionale)</span></Label>
              <Input
                type="email"
                placeholder="mario@esempio.it"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={!form.full_name.trim()}>
              Inizia
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          I tuoi dati sono salvati localmente e non vengono mai inviati a nessun server.
        </p>
      </div>
    </div>
  );
}
