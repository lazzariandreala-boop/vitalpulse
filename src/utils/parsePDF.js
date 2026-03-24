/**
 * Parser per referti di laboratorio italiani (PDF).
 * Supporta i formati ULSS8 Berica (2020/2024), Lifebrain Veneto e simili.
 */

import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// ── pattern da ignorare ───────────────────────────────────────────────────────

const SKIP_RE = [
  /^metodo:/i,
  /^obiettivo/i,
  /^due valori/i,
  /^limite/i,
  /^per la/i,
  /^le concentrazioni/i,
  /^segreteria/i,
  /^pag\./i,
  /^check\s*in/i,
  /^stampa del/i,
  /^data\s*(di\s*)?nascita/i,
  /^cod(ice)?\.\s*fi?s/i,
  /^richiedente/i,
  /^rif\.?\s*:/i,
  /^nr\./i,
  /^referto/i,
  /^direttore/i,
  /^la valutazione/i,
  /^\*+\s*(finale|stampa)/i,
  /^documento firmato/i,
  /^regione\s+veneto/i,
  /^medicina di/i,
  /^microbiologia/i,
  /^esame\s+risultato/i,
  /^ambulatorio/i,
  /^gfr\s+stimata/i,
  /^valori attesi/i,
  /^la formula/i,
  /^il calcolo/i,
  /^attenzione:/i,
  /^deficit/i,
  /^carenza/i,
  /^insufficienza/i,
  /^tossicita'/i,
  /^campione non/i,
  /^rappresentazione/i,
  /^numero di certificato/i,
  /^firmatario/i,
  /^il referto/i,
  /^dove non/i,
  /^\(rdi\)/i,
  /^i risultati/i,
  /^i dati/i,
  /^http/i,
  /\blaboratorio\.analisi@/i,
  /^\s*\*+\s*$/,               // righe con solo asterischi
  /^d\/n\.:/i,
  /^codice\s+fisc/i,
];

// ── unità di misura riconosciute ──────────────────────────────────────────────
// Ordinate per lunghezza decrescente per evitare match parziali

const KNOWN_UNITS = [
  // Unità ematologiche con notazione esponenziale (varie codifiche PDF)
  'x10Æ12/L', 'x10^12/L', 'x10¹²/L', 'x10 12/L', 'x1012/L',
  'x10Æ9/L',  'x10^9/L',  'x10⁹/L',  'x10 9/L',  'x109/L',
  // Forme "G/l" e "T/l" da Lifebrain (Giga e Tera per litro)
  'G/l', 'T/l', 'G/L', 'T/L',
  // Unità di funzionalità renale
  'mL/min/1,73mq', 'mL/min/1.73mq', 'mL/min/1,73m2', 'mL/min/1.73m2',
  'mL/min/1,73', 'mL/min/1.73',
  // Concentrazioni molecolari
  'mg/g creat.', 'mg/g creat',
  'µmol/L', 'umol/L',
  'mmol/mol',
  'mmol/L',
  // Immunologia / ormoni
  'mUI/mL', 'mUI/L', 'mU/L', 'µUI/mL', 'µUI/L',
  'IU/L', 'UI/L', 'U/mL', 'U/l', 'U/L',
  // Ematologia
  'L/L',
  // Vitamine e microelementi
  'ng/mL', 'ng/dL', 'ng/L',
  'pg/mL', 'pg/L',
  'µg/L', 'ug/L',
  'pmol/L', 'nmol/L',
  'mEq/L',
  // Biochimica
  'mg/dL', 'mg/dl',
  'g/dL', 'g/dl', 'g/L',
  'mg/L',
  'fl', 'fL',
  '%',
  // per cento scritto per esteso (alcuni laboratori)
  'per cento',
];

// Parametri specifici senza unità
const UNITLESS_PARAMS = {
  "DENSITA'": { min: 1003, max: 1030 },
  'DENSITA':  { min: 1003, max: 1030 },
  'PH':       { min: 5.5,  max: 6.5  },
};

// ── helpers di parsing numeri ─────────────────────────────────────────────────

/** Converte "3,50" o "3.50" in float */
function itFloat(s) {
  if (!s) return NaN;
  return parseFloat(
    String(s).replace(/\s/g, '').replace(',', '.')
  );
}

/** Sostituisce solo le virgole decimali (tra cifre) con punti */
function normDecimals(s) {
  return s.replace(/(\d),(\d)/g, '$1.$2');
}

// ── parsing del riferimento ───────────────────────────────────────────────────

function parseReference(refStr) {
  if (!refStr || !refStr.trim()) return { min: null, max: null };
  let s = refStr.trim();

  // Forme italiane verbali: "inf. a 190", "fino a 45", "sup. a 40"
  const infMatch = s.match(/^(?:inf\.?\s*a|fino\s*a)\s*([\d,.]+)/i);
  if (infMatch) return { min: null, max: itFloat(infMatch[1]) };

  const supMatch = s.match(/^sup\.?\s*a\s*([\d,.]+)/i);
  if (supMatch) return { min: itFloat(supMatch[1]), max: null };

  // Normalizza i decimali (virgola → punto)
  s = normDecimals(s);

  // `< numero` o `> numero`
  const lt = s.match(/^<\s*([\d.]+)/);
  if (lt) return { min: null, max: parseFloat(lt[1]) };

  const gt = s.match(/^>\s*([\d.]+)/);
  if (gt) return { min: parseFloat(gt[1]), max: null };

  // Range con trattino: "3.50 - 11.00" o "70 - 99" o "0 - 150"
  const dash = s.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (dash) return { min: parseFloat(dash[1]), max: parseFloat(dash[2]) };

  // Range con spazio semplice: "70 99"
  const space = s.match(/^([\d.]+)\s+([\d.]+)/);
  if (space) return { min: parseFloat(space[1]), max: parseFloat(space[2]) };

  return { min: null, max: null };
}

function computeStatus(value, ref, isMarked) {
  if (ref.min !== null && value < ref.min) return 'low';
  if (ref.max !== null && value > ref.max) return 'high';
  if (isMarked) return 'high';
  return 'normal';
}

// ── ricostruzione righe dal PDF ───────────────────────────────────────────────

const ROW_TOL = 6; // pixel di tolleranza per raggruppare nella stessa riga

function itemsToLines(items) {
  const rows = [];
  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    const y = item.transform[5];
    const x = item.transform[4];
    const row = rows.find(r => Math.abs(r.y - y) <= ROW_TOL);
    if (row) {
      row.items.push({ str: item.str, x });
    } else {
      rows.push({ y, items: [{ str: item.str, x }] });
    }
  }
  rows.sort((a, b) => b.y - a.y); // dall'alto al basso
  return rows.map(r => {
    r.items.sort((a, b) => a.x - b.x);
    return r.items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
}

// ── decodifica testo offuscato (Lifebrain) ────────────────────────────────────

/**
 * Alcuni PDF usano una codifica con shift ASCII +29 sul char code.
 * Es: "(VDPH" → "Esame", "/$==$5" → "LAZZAR"
 * Il carattere "/" (47) diventa 18 (controllo) → sparisce nel testo estratto.
 */
const GARBLED_MARKERS = ['(VDPH', '5LVXOWDWR', '&+,0,&$', '(0$72/2*,$'];

function tryDecodeGarbled(text) {
  if (!GARBLED_MARKERS.some(m => text.includes(m))) return text;
  return text.split('').map(c => {
    const code = c.charCodeAt(0);
    // Preserva spazi (32), newline (10) e CR (13): sono inseriti da pdfjs come
    // separatori di parole/riga e NON fanno parte dello shift +29.
    if (code === 10 || code === 13 || code === 32) return c;
    if (code >= 33 && code <= 125) {
      const d = code + 29;
      return d <= 126 ? String.fromCharCode(d) : c;
    }
    return c;
  }).join('');
}

// ── parsing di una singola riga ───────────────────────────────────────────────

function parseLine(line) {

  // --- Valori ASSENTE / ASSENTI (analisi urine) ---
  const absentRe = /^([A-ZÀ-Üa-zà-ü][^\n]*?)\s+ASSENTE?I?\b/i;
  const absentM = line.match(absentRe);
  if (absentM && !/metodo|campione/i.test(absentM[1])) {
    return {
      parameter: absentM[1].trim(),
      value: 0, unit: '—', status: 'normal',
      reference_min: null, reference_max: null,
    };
  }

  // --- Parametri senza unità (pH, densità) ---
  for (const [key, defRef] of Object.entries(UNITLESS_PARAMS)) {
    const re = new RegExp(`^(${key})\\s+\\*?\\s*([\\d\\s,.]+)\\s*(.*)$`, 'i');
    const m = line.match(re);
    if (m) {
      const value = itFloat(m[2].replace(/\s/g, ''));
      if (isNaN(value)) continue;
      const ref = parseReference(m[3]);
      const usedRef = (ref.min !== null || ref.max !== null) ? ref : defRef;
      const isMarked = line.includes('*');
      return {
        parameter: m[1].trim(), value, unit: '—',
        status: computeStatus(value, usedRef, isMarked),
        reference_min: usedRef.min ?? null,
        reference_max: usedRef.max ?? null,
      };
    }
  }

  // --- Righe con unità di misura ---
  let foundUnit = null;
  let unitStart = -1;

  for (const u of KNOWN_UNITS) {
    const idx = line.indexOf(u);
    if (idx !== -1) {
      foundUnit = u;
      unitStart = idx;
      break;
    }
  }
  if (!foundUnit) return null;

  const beforeUnit = line.substring(0, unitStart).trim();
  const afterUnit  = line.substring(unitStart + foundUnit.length).trim();

  // Approccio token: suddivide per spazi e trova l'ultimo token numerico puro.
  // Evita il match greedy su nomi come "VITAMINA B12 350" che darebbe "12 350".
  // Token numerico: opzionale ">" + cifre + virgole/punti (es: "350", "7,33", ">146")
  const tokens = beforeUnit.split(/\s+/);
  let valueIdx = -1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (/^>?[0-9][0-9,.]*$/.test(tokens[i])) { valueIdx = i; break; }
  }
  if (valueIdx === -1) return null;

  const rawTok      = tokens[valueIdx];
  const hasGtPrefix = rawTok.startsWith('>');
  const rawVal      = rawTok.replace(/^>/, '');
  const value       = itFloat(rawVal);
  if (isNaN(value)) return null;

  // Nome parametro = tutti i token prima del valore, senza '*' finale
  const nameRaw  = tokens.slice(0, valueIdx).join(' ').trim();
  const isMarked = nameRaw.includes('*') || beforeUnit.includes(' * ');
  const paramName = nameRaw.replace(/[*\s]+$/, '').trim();

  if (!paramName || paramName.length < 1) return null;

  // Salta intestazioni di sezione
  if (/^(chimica|esame urine|sedimento|microscopia|urinaria|ematologia|autoimmunita|funzionalita|dosaggi|biochimica|conteggio)/i.test(paramName)) return null;

  // Calcola riferimento e status
  const ref = parseReference(afterUnit);

  // Se il valore ha prefisso ">", è "maggiore di X" → di solito normale se ref è > soglia
  let status;
  if (hasGtPrefix) {
    // es: ">146 pmol/L sup a 70" → valore 146+ > 70 → normale
    status = (ref.min !== null && value < ref.min) ? 'low' : 'normal';
  } else {
    status = computeStatus(value, ref, isMarked);
  }

  return {
    parameter: paramName,
    value,
    unit: normalizeUnit(foundUnit),
    status,
    reference_min: ref.min,
    reference_max: ref.max,
  };
}

/** Normalizza le varianti di unità verso un formato canonico */
function normalizeUnit(u) {
  if (/^x10[Æ^⁹]?9\/L$/i.test(u) || u === 'x10 9/L' || u === 'x109/L') return '×10⁹/L';
  if (/^x10[Æ^¹²]?12\/L$/i.test(u) || u === 'x10 12/L' || u === 'x1012/L') return '×10¹²/L';
  if (u === 'G/l') return 'G/L';
  if (u === 'T/l') return 'T/L';
  if (u === 'mg/dl') return 'mg/dL';
  if (u === 'g/dl') return 'g/dL';
  if (u === 'U/l') return 'U/L';
  if (u === 'umol/L') return 'µmol/L';
  if (u === 'ug/L') return 'µg/L';
  if (u === 'per cento') return '%';
  if (u === 'fL') return 'fl';
  if (u.startsWith('mL/min/')) return 'mL/min/1.73m²';
  return u;
}

// ── entry point pubblico ──────────────────────────────────────────────────────

/**
 * Estrae i risultati di laboratorio da un file PDF.
 * @param {File} file
 * @returns {Promise<Array<{parameter, value, unit, status, reference_min, reference_max}>>}
 */
/**
 * Estrae il testo grezzo da un PDF, riga per riga (utile per debug).
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export async function extractRawLines(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const allLines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc   = await page.getTextContent();
    let lines  = itemsToLines(tc.items);
    const pageText = lines.join('\n');
    const decoded  = tryDecodeGarbled(pageText);
    lines = decoded !== pageText ? decoded.split('\n') : lines;
    allLines.push(...lines);
  }
  return allLines;
}

export async function parsePDFLabResults(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const allLines = [];
  let wasGarbled = false;

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc   = await page.getTextContent();
    let lines  = itemsToLines(tc.items);

    // Unisci le righe della pagina per rilevare offuscamento
    const pageText = lines.join('\n');
    const decoded  = tryDecodeGarbled(pageText);
    if (decoded !== pageText) {
      // Il testo era offuscato (es. Lifebrain Veneto) → riprocessa le righe decodificate
      wasGarbled = true;
      lines = decoded.split('\n');
    }

    allLines.push(...lines);
  }

  const results = [];
  const seen    = new Set();

  for (const line of allLines) {
    if (SKIP_RE.some(re => re.test(line))) continue;
    if (!line.trim()) continue;

    const result = parseLine(line);
    if (!result) continue;

    // Deduplicazione per nome parametro (tiene la prima occorrenza = unità primaria)
    const key = result.parameter.toUpperCase().replace(/[\s()\-]/g, '');
    if (seen.has(key)) continue;
    seen.add(key);

    results.push(result);
  }

  return { results, wasGarbled };
}
