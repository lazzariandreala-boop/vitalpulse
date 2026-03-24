import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, FileText } from 'lucide-react';

export default function BloodTestUpload({ onClose }) {
  const [file, setFile] = useState(null);
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState('');
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.BloodTest.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      setSaved(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleSave = () => {
    saveMutation.mutate({
      test_date: testDate,
      lab_name: labName,
      file_name: file?.name || '',
      results: [],
    });
  };

  if (saved) {
    return (
      <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4 text-center py-8">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium">Analisi salvate con successo!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Carica Analisi del Sangue</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Data Analisi *</Label>
            <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Laboratorio</Label>
            <Input placeholder="Nome laboratorio" value={labName} onChange={e => setLabName(e.target.value)} />
          </div>
        </div>

        <div
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById('pdf-upload').click()}
        >
          <input id="pdf-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carica il documento delle analisi</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG o PNG</p>
            </>
          )}
        </div>

        <Button onClick={handleSave} className="w-full rounded-xl" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Salvataggio...' : 'Salva Analisi'}
        </Button>
      </div>
    </div>
  );
}
