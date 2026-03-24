import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import {
  User, Save, LogOut, Copy, Check, Stethoscope,
  Phone, ChevronDown, X, Syringe, Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

// ── dati ────────────────────────────────────────────────────────────────────

const PATOLOGIE = [
  'Ipertensione arteriosa', 'Ipotensione', 'Cardiopatia ischemica', 'Fibrillazione atriale',
  'Insufficienza cardiaca', 'Ictus / TIA', 'Arteriosclerosi',
  'Diabete tipo 1', 'Diabete tipo 2', 'Ipercolesterolemia / Iperlipidemia', 'Obesità',
  'Ipotiroidismo', 'Ipertiroidismo', 'Sindrome metabolica',
  'Asma bronchiale', 'BPCO', 'Apnee nel sonno', 'Bronchite cronica',
  'Reflusso gastroesofageo (GERD)', 'Ulcera peptica', 'Colite ulcerosa', 'Malattia di Crohn',
  'Colon irritabile (IBS)', 'Celiachia', 'Steatosi epatica', 'Cirrosi epatica',
  'Epatite B', 'Epatite C',
  'Insufficienza renale cronica', 'Calcolosi renale',
  'Artrosi', 'Artrite reumatoide', 'Osteoporosi', 'Fibromialgia', 'Gotta',
  'Emicrania', 'Epilessia', 'Parkinson', 'Alzheimer', 'Sclerosi multipla',
  'Depressione', 'Ansia generalizzata', 'Disturbo bipolare',
  'Psoriasi', 'Dermatite atopica', 'Lupus eritematoso sistemico',
  'Glaucoma', 'Cataratta', 'Retinopatia diabetica',
  'Anemia', 'Talassemia', 'Ipertrofia prostatica benigna', 'Endometriosi',
  'Sindrome dell\'ovaio policistico (PCOS)',
];

const ALLERGIE = [
  'Penicillina', 'Amoxicillina', 'Cefalosporine', 'Sulfamidici',
  'Aspirina', 'Ibuprofene / FANS', 'Codeina', 'Anestetici locali', 'Metformina',
  'Lattice', 'Nichel', 'Profumi / Fragranze',
  'Polline (graminacee)', 'Polline (alberi)', 'Ambrosia', 'Acari della polvere',
  'Muffa', 'Pelo di gatto', 'Pelo di cane', 'Punture di insetti (api/vespe)',
  'Latte / Latticini', 'Uova', 'Grano / Glutine', 'Arachidi',
  'Frutta a guscio (noci, nocciole)', 'Pesce', 'Crostacei / Molluschi',
  'Soia', 'Sesamo',
];

const GRUPPI = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', '0+', '0−'];

// ── helper: multi-select con ricerca ────────────────────────────────────────

function MultiSelect({ options, selected, onChange, placeholder, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  );

  const toggle = (value) => {
    onChange(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    );
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              {Icon && <Icon className="w-4 h-4" />}
              {selected.length === 0 ? placeholder : `${selected.length} selezionat${selected.length === 1 ? 'o' : 'i'}`}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Cerca..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="py-4 text-sm text-center text-muted-foreground">
                Nessun risultato trovato.
              </CommandEmpty>
              <CommandGroup>
                {filtered.map(option => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => { toggle(option); setSearch(''); }}
                    className="py-2.5 text-sm cursor-pointer"
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selected.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── sezione con titolo ───────────────────────────────────────────────────────

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
      </div>
      <div className="space-y-4 pl-1">
        {children}
      </div>
    </div>
  );
}

// ── campo con label ──────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}

// ── pagina principale ────────────────────────────────────────────────────────

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    full_name: '', email: '',
    date_of_birth: '', gender: '', height: '', blood_type: '',
    allergies: [], chronic_conditions: [], emergency_contact: '',
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
        allergies: user.allergies
          ? (Array.isArray(user.allergies) ? user.allergies : user.allergies.split(', ').filter(Boolean))
          : [],
        chronic_conditions: user.chronic_conditions
          ? (Array.isArray(user.chronic_conditions) ? user.chronic_conditions : user.chronic_conditions.split(', ').filter(Boolean))
          : [],
        emergency_contact: user.emergency_contact || '',
      });
    }
  }, [user]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    updateUser({
      ...form,
      height: form.height ? Number(form.height) : undefined,
      allergies: form.allergies.join(', '),
      chronic_conditions: form.chronic_conditions.join(', '),
    });
    toast({ id: 'profile-save', variant: 'success', title: 'Profilo aggiornato', description: 'Le tue informazioni sono state salvate.' });
    setSaving(false);
  };

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  const initials = (user.full_name || '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-6 pb-24 lg:pb-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profilo</h1>
        <p className="text-sm text-muted-foreground mt-1">Le tue informazioni sanitarie di base</p>
      </div>

      {/* Avatar + nome + ID — full width */}
      <Card className="shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xl shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-lg leading-tight">{user.full_name || 'Utente'}</p>
              {user.email && <p className="text-sm text-muted-foreground truncate">{user.email}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md truncate max-w-[240px]">
                  {user.id}
                </span>
                <button
                  onClick={copyId}
                  className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="Copia ID"
                >
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid desktop: 2 colonne — mobile: 1 colonna */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Colonna sinistra */}
        <div className="space-y-6">
          <Card className="shadow-sm h-full">
            <CardContent className="pt-6 pb-6 space-y-8">

              <Section icon={User} title="Dati personali" color="bg-blue-500/10 text-blue-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nome completo">
                    <Input
                      value={form.full_name}
                      onChange={e => set('full_name', e.target.value)}
                      className="h-11 text-base rounded-xl"
                      placeholder="Mario Rossi"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className="h-11 text-base rounded-xl"
                      placeholder="mario@esempio.it"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Data di nascita">
                    <Input
                      type="date"
                      value={form.date_of_birth}
                      onChange={e => set('date_of_birth', e.target.value)}
                      className="h-11 text-base rounded-xl"
                    />
                  </Field>
                  <Field label="Sesso">
                    <Select value={form.gender} onValueChange={v => set('gender', v)}>
                      <SelectTrigger className="h-11 text-base rounded-xl">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male" className="text-base py-3">Maschio</SelectItem>
                        <SelectItem value="female" className="text-base py-3">Femmina</SelectItem>
                        <SelectItem value="other" className="text-base py-3">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>

              <div className="border-t" />

              <Section icon={Activity} title="Dati clinici" color="bg-primary/10 text-primary">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Altezza (cm)">
                    <Input
                      type="number"
                      placeholder="175"
                      value={form.height}
                      onChange={e => set('height', e.target.value)}
                      className="h-11 text-base rounded-xl"
                      min={50} max={250}
                    />
                  </Field>
                  <Field label="Gruppo sanguigno">
                    <Select value={form.blood_type} onValueChange={v => set('blood_type', v)}>
                      <SelectTrigger className="h-11 text-base rounded-xl">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {GRUPPI.map(bt => (
                          <SelectItem key={bt} value={bt} className="text-base py-3">{bt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>

              <div className="border-t" />

              <Section icon={Phone} title="Contatto di emergenza" color="bg-green-500/10 text-green-500">
                <Field label="Nome e numero di telefono">
                  <Input
                    placeholder="Es. Anna Rossi — 333 1234567"
                    value={form.emergency_contact}
                    onChange={e => set('emergency_contact', e.target.value)}
                    className="h-11 text-base rounded-xl"
                  />
                </Field>
              </Section>

            </CardContent>
          </Card>
        </div>

        {/* Colonna destra */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6 pb-6 space-y-8">

              <Section icon={Stethoscope} title="Condizioni croniche" color="bg-amber-500/10 text-amber-500">
                <Field label="Seleziona le tue patologie (puoi sceglierne più d'una)">
                  <MultiSelect
                    options={PATOLOGIE}
                    selected={form.chronic_conditions}
                    onChange={v => set('chronic_conditions', v)}
                    placeholder="Inizia a cercare una patologia..."
                    icon={Stethoscope}
                  />
                </Field>
              </Section>

              <div className="border-t" />

              <Section icon={Syringe} title="Allergie e intolleranze" color="bg-red-500/10 text-red-500">
                <Field label="Seleziona le tue allergie (puoi sceglierne più d'una)">
                  <MultiSelect
                    options={ALLERGIE}
                    selected={form.allergies}
                    onChange={v => set('allergies', v)}
                    placeholder="Inizia a cercare un'allergia..."
                    icon={Syringe}
                  />
                </Field>
              </Section>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Bottoni full-width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="w-full h-12 text-base rounded-xl text-destructive border-destructive/30 hover:text-destructive hover:bg-destructive/5"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Esci dall'account
        </Button>

        <Button
          onClick={handleSave}
          className="w-full h-12 text-base rounded-xl font-semibold shadow-sm shadow-primary/20"
          disabled={saving}
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva Profilo'}
        </Button>
      </div>

    </div>
  );
}
