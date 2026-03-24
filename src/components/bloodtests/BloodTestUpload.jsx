import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { parsePDFLabResults, extractRawLines } from '@/utils/parsePDF';
import { cn } from '@/lib/utils';

const statusConfig = {
  normal: { label: 'Normale', cls: 'bg-green-500/15 text-green-400' },
  low:    { label: 'Basso',   cls: 'bg-blue-500/15 text-blue-400' },
  high:   { label: 'Alto',    cls: 'bg-red-500/15 text-red-400' },
};

export default function BloodTestUpload({ onClose }) {
  const [file, setFile]           = useState(null);
  const [testDate, setTestDate]   = useState(new Date().toISOString().split('T')[0]);
  const [labName, setLabName]     = useState('');
  const [parsing, setParsing]     = useState(false);
  const [parseError, setParseError] = useState(null);
  const [results, setResults]     = useState(null); // null = non ancora parsato
  const [showPreview, setShowPreview] = useState(true);
  const [rawLines, setRawLines] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.BloodTest.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      onClose();
    },
  });

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setResults(null);
    setParseError(null);

    // Auto-rileva il laboratorio dal nome file se possibile
    if (!labName && selected.name) {
      const cleaned = selected.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      if (cleaned.length < 50) setLabName(cleaned);
    }

    // Parsa solo i PDF
    if (!selected.type.includes('pdf') && !selected.name.toLowerCase().endsWith('.pdf')) return;

    setParsing(true);
    try {
      const { results: parsed, wasGarbled } = await parsePDFLabResults(selected);
      setResults(parsed);
      if (parsed.length === 0) {
        // Estrai righe grezze per debug
        const lines = await extractRawLines(selected);
        setRawLines(lines);
        if (wasGarbled) {
          setParseError('Formato Lifebrain Veneto rilevato: la codifica speciale usata da questo laboratorio impedisce l\'estrazione automatica dei valori numerici. Inserisci i dati manualmente o usa il PDF di un altro laboratorio.');
        } else {
          setParseError('Nessun parametro riconosciuto. Verifica che il file sia un referto di laboratorio italiano.');
        }
      }
    } catch (err) {
      console.error('PDF parse error:', err);
      setParseError('Impossibile leggere il PDF. Il file potrebbe essere protetto o corrotto.');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({
      test_date: testDate,
      lab_name: labName,
      file_name: file?.name || '',
      results: results || [],
    });
  };

  const abnormal = results?.filter(r => r.status !== 'normal') ?? [];

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-base">Carica Analisi del Sangue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Il PDF verrà analizzato automaticamente</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Campi data e laboratorio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Data Analisi *</Label>
            <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} className="h-10" required />
          </div>
          <div>
            <Label className="text-sm">Laboratorio</Label>
            <Input placeholder="Nome laboratorio" value={labName} onChange={e => setLabName(e.target.value)} className="h-10" />
          </div>
        </div>

        {/* Upload area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
            file ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/40 hover:bg-muted/30'
          )}
          onClick={() => document.getElementById('pdf-upload').click()}
        >
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
          {parsing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-primary">Analisi del referto in corso...</p>
              <p className="text-xs text-muted-foreground">Estrazione parametri</p>
            </div>
          ) : file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-6 h-6 text-primary shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {results !== null && (
                  <p className="text-xs text-muted-foreground">
                    {results.length} parametri estratti
                    {abnormal.length > 0 && ` · ${abnormal.length} fuori range`}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Trascina il PDF qui o clicca per sfogliare</p>
              <p className="text-xs text-muted-foreground mt-1">PDF · JPG · PNG</p>
            </>
          )}
        </div>

        {/* Errore parsing */}
        {parseError && (
          <div className="flex items-start gap-2 bg-red-500/10 text-red-400 rounded-xl px-3 py-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{parseError}</p>
          </div>
        )}

        {/* Debug: righe grezze PDF (solo quando 0 risultati) */}
        {rawLines && (
          <div className="border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRaw(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <span className="text-xs font-medium text-muted-foreground">
                Testo grezzo estratto ({rawLines.length} righe) — utile per debug
              </span>
              {showRaw ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showRaw && (
              <div className="max-h-48 overflow-y-auto px-4 py-2 bg-muted/20">
                {rawLines.map((l, i) => (
                  <p key={i} className="text-[11px] font-mono text-muted-foreground py-0.5 border-b border-border/30 last:border-0">{l || <em>(riga vuota)</em>}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview risultati */}
        {results && results.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            {/* header preview */}
            <button
              type="button"
              onClick={() => setShowPreview(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">
                  {results.length} parametri rilevati
                  {abnormal.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-red-400">
                      ({abnormal.length} fuori range)
                    </span>
                  )}
                </span>
              </div>
              {showPreview
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />
              }
            </button>

            {showPreview && (
              <div className="divide-y max-h-64 overflow-y-auto">
                {results.map((r, i) => {
                  const sc = statusConfig[r.status] || statusConfig.normal;
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/20">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium truncate block">{r.parameter}</span>
                        {(r.reference_min !== null || r.reference_max !== null) && (
                          <span className="text-xs text-muted-foreground">
                            ref: {r.reference_min !== null ? r.reference_min : ''}
                            {r.reference_min !== null && r.reference_max !== null ? '–' : ''}
                            {r.reference_max !== null ? r.reference_max : ''}
                            {' '}{r.unit}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="font-mono font-semibold">
                          {r.value} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>
                        </span>
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', sc.cls)}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottone salva */}
        <Button
          onClick={handleSave}
          className="w-full h-11 text-base rounded-xl font-semibold"
          disabled={!file || parsing || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvataggio...</>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Salva Analisi {results?.length ? `(${results.length} parametri)` : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
