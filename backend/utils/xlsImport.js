// utils/xlsImport.js
const XLSX = require("xlsx");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const NUM = (s) => Number(String(s).replace(/[^\d.-]/g, "")) || 0;
const PA = (n) => Math.round(n * 100);

// normalize to **noon UTC** to avoid IST↔UTC day rollovers
function noonUTC(y, m /* 1–12 */, d) {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
}
function noonUTCfromDayjs(dj) {
  return new Date(Date.UTC(dj.year(), dj.month(), dj.date(), 12, 0, 0, 0));
}

function parseDate(v) {
  if (v == null || v === "") return null;

  // 1) Excel serial number
  if (typeof v === "number") {
    const o = XLSX.SSF.parse_date_code(v);
    if (!o) return null;
    return noonUTC(o.y, o.m, o.d); // NOTE: m already 1..12
  }

  const s = String(v).trim().replace(/\s+/g, " ");
  const fmts = [
    "DD/MM/YYYY",
    "D/M/YYYY",
    "DD/MM/YY",
    "D/M/YY",
    "DD-MM-YYYY",
    "D-M-YYYY",
    "DD.MM.YYYY",
    "DD MMM YYYY",
    "D MMM YYYY",
    "YYYY-MM-DD",
    "MM/DD/YYYY",
    "M/D/YYYY",
    "MM/DD/YY",
    "M/D/YY",
  ];

  const dj = dayjs(s.replace(/\bSept\b/gi, "Sep"), fmts, true);
  if (dj.isValid()) return noonUTCfromDayjs(dj);

  // 3) Fallback for 12/8/25 style (assume D/M/YY)
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2})$/);
  if (m) {
    let [, d, mo, yy] = m.map(Number);
    const y = yy >= 70 ? 1900 + yy : 2000 + yy;
    return noonUTC(y, mo, d);
  }

  return null;
}

const pickDenseSheet = (wb) => {
  let best = { name: wb.SheetNames[0], rows: -1 };
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const ref = ws["!ref"];
    if (!ref) continue;
    const rng = XLSX.utils.decode_range(ref);
    const rows = rng.e.r - rng.s.r + 1;
    if (rows > best.rows) best = { name, rows };
  }
  return best.name;
};

const detectHeaderIndex = (matrix) => {
  // Look in first 30 rows for "date" AND ("description"/"narration"/"details"/"particular")
  const has = (row, re) => row.some((c) => re.test(String(c)));
  for (let i = 0; i < Math.min(30, matrix.length); i++) {
    const row = matrix[i];
    if (has(row, /date/i) && has(row, /(description|narration|details|particular)/i)) return i;
  }
  return -1;
};

function parseXlsx(buffer, mapping) {
  const wb = XLSX.read(buffer, { type: "buffer" });

  // 1) choose the most "dataful" sheet
  const sheetName = pickDenseSheet(wb);
  const ws = wb.Sheets[sheetName];

  // 2) read as matrix
  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  // 3) header row
  let headerRowIndex =
    typeof mapping?.headerRowIndex === "number" ? mapping.headerRowIndex : detectHeaderIndex(matrix);

  if (headerRowIndex === -1) {
    return {
      rows: [],
      headersDetected: { sheetName, headerRowIndex: -1, headers: null, preview: matrix.slice(0, 10) },
    };
  }

  const headers = matrix[headerRowIndex].map((h) => String(h).trim());
  const data = matrix.slice(headerRowIndex + 1);

  const idxOf = (regexes) => {
    const i = headers.findIndex((h) => regexes.some((rx) => rx.test(h)));
    return i === -1 ? null : i;
  };

  // 4) column indices
  const dateIdx = mapping?.dateIdx ?? idxOf([/date/i, /txn\s*date/i, /value\s*date/i, /posting/i]);
  const descIdx =
    mapping?.descIdx ?? idxOf([/description/i, /narration/i, /details/i, /particular/i, /reference/i]);
  const debitIdx = mapping?.debitIdx ?? idxOf([/debit/i, /withdraw(al)?/i, /\bdr\b/i]);
  const creditIdx = mapping?.creditIdx ?? idxOf([/credit/i, /deposit/i, /\bcr\b/i]);
  const balanceIdx = mapping?.balanceIdx ?? idxOf([/balance/i, /closing/i, /running/i]);

  const rows = [];
  for (const row of data) {
    const get = (i) => (i == null ? "" : row[i]);

    const date = parseDate(get(dateIdx));
    const description = String(get(descIdx) ?? "").trim();
    const debit = NUM(get(debitIdx));
    const credit = NUM(get(creditIdx));
    const balance = NUM(get(balanceIdx));

    if (!date || !description) continue;

    const debitPaise = debit ? PA(debit) : 0;
    const creditPaise = credit ? PA(credit) : 0;
    const amountPaise = creditPaise ? creditPaise : debitPaise ? -debitPaise : 0;
    const balancePaise = balance ? PA(balance) : undefined;

    rows.push({ date, description, debitPaise, creditPaise, amountPaise, balancePaise, raw: row });
  }

  return { rows, headersDetected: { sheetName, headerRowIndex, headers } };
}

module.exports = { parseXlsx };
