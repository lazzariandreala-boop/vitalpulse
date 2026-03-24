import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Save, LogOut, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    full_name: '', email: '',
    date_of_birth: '', gender: '', height: '', blood_type: '',
    allergies: '', chronic_conditions: '', emergency_contact: '',
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        height: user.height || '',
        blood_type: user.blood_type || '',
        allergies: user.allergies || '',
        chronic_conditions: user.chronic_conditions || '',
        emergency_contact: user.emergency_contact || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    updateUser({
      ...form,
      height: form.height ? Number(form.height) : undefined,
    });
    toast({ variant: 'success', title: 'Profilo aggiornato', description: 'Le tue informazioni sono state salvate.' });
    setSaving(false);
  };

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profilo</h1>
        <p className="text-sm text-muted-foreground mt-1">Le tue informazioni sanitarie di base</p>
      </div>

      {/* User ID card */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">ID utente</p>
              <p className="text-xs font-mono text-foreground truncate">{user.id}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={copyId} className="shrink-0 h-8 w-8 p-0">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.full_name}</CardTitle>
              {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nome completo</Label>
              <Input value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data di nascita</Label>
              <Input type="date" value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Sesso</Label>
              <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Maschio</SelectItem>
                  <SelectItem value="female">Femmina</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Altezza (cm)</Label>
              <Input type="number" placeholder="175" value={form.height}
                onChange={e => setForm({ ...form, height: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Gruppo sanguigno</Label>
              <Select value={form.blood_type} onValueChange={v => setForm({ ...form, blood_type: v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map(bt => (
                    <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Allergie</Label>
            <Input placeholder="Es. Penicillina, polline..." value={form.allergies}
              onChange={e => setForm({ ...form, allergies: e.target.value })} />
          </div>

          <div>
            <Label className="text-xs">Condizioni croniche</Label>
            <Input placeholder="Es. Diabete, ipertensione..." value={form.chronic_conditions}
              onChange={e => setForm({ ...form, chronic_conditions: e.target.value })} />
          </div>

          <div>
            <Label className="text-xs">Contatto emergenza</Label>
            <Input placeholder="Nome e numero di telefono" value={form.emergency_contact}
              onChange={e => setForm({ ...form, emergency_contact: e.target.value })} />
          </div>

          <Button onClick={handleSave} className="w-full rounded-xl" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvataggio...' : 'Salva Profilo'}
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={logout}>
        <LogOut className="w-4 h-4 mr-2" />
        Esci
      </Button>
    </div>
  );
}
