import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ARM_LABELS = { left: 'Sinistro', right: 'Destro' };
const POS_LABELS = { sitting: 'Seduto', standing: 'In piedi', lying: 'Sdraiato' };

// Colors matching the app palette
const C_PRIMARY    = [14, 165, 233];   // sky-500  #0ea5e9
const C_PRIMARY_LT = [224, 242, 254];  // sky-100
const C_HEADER_TXT = [15, 23, 42];     // slate-900
const C_MUTED      = [100, 116, 139];  // slate-500
const C_BORDER     = [226, 232, 240];  // slate-200
const C_ROW_ALT    = [248, 250, 252];  // slate-50

const C_CRISIS   = [239, 68,  68];   // red-500
const C_HIGH2    = [249, 115, 22];   // orange-500
const C_HIGH1    = [251, 191, 36];   // amber-400
const C_ELEVATED = [254, 240, 138];  // yellow-200
const C_OK       = [240, 253, 244];  // green-50

const STATUS_LABELS = {
  normal:   'Normale',
  elevated: 'Elevata',
  high1:    'Ipertensione I',
  high2:    'Ipertensione II',
  crisis:   'Crisi Ipertensiva',
};

function bpStatus(s, d) {
  if (!s || !d) return null;
  if (s > 180 || d > 120) return 'crisis';
  if (s >= 140 || d >= 90) return 'high2';
  if (s >= 130 || d >= 80) return 'high1';
  if (s >= 120 && d < 80)  return 'elevated';
  return 'normal';
}

function statusColors(st) {
  if (st === 'crisis')   return { fill: C_CRISIS,   text: [255, 255, 255], bold: true };
  if (st === 'high2')    return { fill: C_HIGH2,    text: [255, 255, 255], bold: false };
  if (st === 'high1')    return { fill: C_HIGH1,    text: [30,  30,  30],  bold: false };
  if (st === 'elevated') return { fill: C_ELEVATED, text: [80,  60,  0],   bold: false };
  return null;
}

function dayLabel(isoDay) {
  const d = new Date(isoDay + 'T12:00:00');
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function exportBPPdf(readings, userName = '') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ── Top accent bar ────────────────────────────────────────────────────────
  doc.setFillColor(...C_PRIMARY);
  doc.rect(0, 0, PAGE_W, 3, 'F');

  // ── Title block ───────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setTextColor(...C_HEADER_TXT);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Pressione Arteriosa', MARGIN, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C_MUTED);

  let metaY = 24;
  if (userName) {
    doc.text(`Paziente: ${userName}`, MARGIN, metaY);
    metaY += 5;
  }
  const dateStr = new Date().toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  doc.text(`Generato il: ${dateStr}`, MARGIN, metaY);

  // ── Build rows grouped by day ─────────────────────────────────────────────
  const sorted = [...readings].sort((a, b) => {
    const da = a.measured_at || a.created_date || '';
    const db = b.measured_at || b.created_date || '';
    return db < da ? -1 : db > da ? 1 : 0;
  });

  // Each entry in tableBody is either a data row or a day-separator row
  const tableBody = [];
  // Parallel meta array to track per-row styling (only for data rows)
  const rowMeta = [];

  let lastDay = null;
  let dataIdx = 0; // index into rowMeta for didParseCell lookup

  sorted.forEach(r => {
    const ts  = r.measured_at || r.created_date || '';
    const day = ts.slice(0, 10);

    if (day !== lastDay) {
      tableBody.push([{
        content: dayLabel(day || new Date().toISOString().slice(0, 10)),
        colSpan: 7,
        styles: {
          fillColor: C_PRIMARY_LT,
          textColor: C_PRIMARY,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        },
      }]);
      rowMeta.push(null); // separator has no meta
      lastDay = day;
    }

    const dt  = new Date(ts);
    const bp  = (r.systolic && r.diastolic) ? `${r.systolic}/${r.diastolic}` : '—';
    const hr  = r.heart_rate ? String(r.heart_rate) : '—';
    const st  = bpStatus(r.systolic, r.diastolic);

    tableBody.push([
      dt.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      bp,
      hr,
      ARM_LABELS[r.arm] || '—',
      POS_LABELS[r.position] || '—',
      st ? STATUS_LABELS[st] : '—',
    ]);
    rowMeta.push({ status: st, hrAbnormal: r.heart_rate && (r.heart_rate > 100 || r.heart_rate < 60), idx: dataIdx });
    dataIdx++;
  });

  // ── Table ─────────────────────────────────────────────────────────────────
  const COL_W = [22, 14, 26, 18, 24, 26, 32]; // total = 162 → fits in 182

  autoTable(doc, {
    startY: metaY + 8,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Data', 'Ora', 'Pressione', 'Battiti', 'Braccio', 'Posizione', 'Stato']],
    body: tableBody,
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      font: 'helvetica',
      textColor: C_HEADER_TXT,
      lineColor: C_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    columnStyles: Object.fromEntries(COL_W.map((w, i) => [i, { cellWidth: w }])),
    didParseCell(data) {
      if (data.section !== 'body') return;
      const meta = rowMeta[data.row.index];
      if (!meta) return; // separator row, already styled via colSpan styles

      const { status: st, hrAbnormal } = meta;
      const col = data.column.index;

      // Alternate background for normal rows
      if (meta.idx % 2 === 1) {
        data.cell.styles.fillColor = C_ROW_ALT;
      }

      // Pressure column
      if (col === 2 && st) {
        const c = statusColors(st);
        if (c) { data.cell.styles.fillColor = c.fill; data.cell.styles.textColor = c.text; if (c.bold) data.cell.styles.fontStyle = 'bold'; }
      }

      // Heart rate column
      if (col === 3 && hrAbnormal) {
        data.cell.styles.fillColor = C_HIGH2;
        data.cell.styles.textColor = [255, 255, 255];
      }

      // Status column
      if (col === 6 && st) {
        const c = statusColors(st);
        if (c) { data.cell.styles.fillColor = c.fill; data.cell.styles.textColor = c.text; if (c.bold) data.cell.styles.fontStyle = 'bold'; }
      }

      // Normal status: subtle green tint on status cell only
      if (col === 6 && st === 'normal') {
        data.cell.styles.fillColor = C_OK;
        data.cell.styles.textColor = [22, 101, 52];
      }
    },
  });

  // ── Legend ────────────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY;

  // Thin separator line
  doc.setDrawColor(...C_BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, finalY + 6, PAGE_W - MARGIN, finalY + 6);

  doc.setFontSize(7.5);
  doc.setTextColor(...C_MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('Legenda', MARGIN, finalY + 11);

  doc.setFont('helvetica', 'normal');
  const legendLines = [
    'Normale: <120/80 mmHg   |   Elevata: 120–129 / <80   |   Ipertensione I: 130–139 / 80–89',
    'Ipertensione II: ≥140 / ≥90   |   Crisi ipertensiva: >180 / >120',
    'Battiti normali: 60–100 bpm  —  I valori colorati in arancione o rosso superano le soglie raccomandate.',
  ];
  legendLines.forEach((line, i) => {
    doc.text(line, MARGIN, finalY + 16 + i * 5);
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text(`VitalPulse — pagina ${p} di ${pageCount}`, PAGE_W / 2, 290, { align: 'center' });
  }

  doc.save(`pressione_${new Date().toISOString().slice(0, 10)}.pdf`);
}
