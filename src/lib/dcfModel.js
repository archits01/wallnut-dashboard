/**
 * DCF Valuation Engine — Wallnut Building Solutions India Pvt. Ltd.
 * All monetary values in ₹ Lakhs (L) unless stated.
 * Shares: 10,00,000 (1 million). VPS in ₹.
 *
 * Formula:
 *   TV_nominal  = FCFF_last × (1 + g) / (r − g)
 *   TV_PV       = TV_nominal / (1 + r)^4.5
 *   EV          = Σ PV(FCFFs) + TV_PV
 *   Net Equity  = EV × (1 − DLOM%) − LT Debt + Cash
 *   VPS (₹)     = Net Equity (₹L) × 1,00,000 / 10,00,000 = Net Equity × 0.1
 */

export const FCFFS   = [14.98, 95.89, 177.21, 551.53, 1391.68]; // ₹L, FY26-27E → FY30-31E
export const PERIODS = [0.5, 1.5, 2.5, 3.5, 4.5];
export const YEARS   = ['FY26-27E', 'FY27-28E', 'FY28-29E', 'FY29-30E', 'FY30-31E'];
export const LTD     = 4207.94;   // Long-term borrowings ₹L
export const CASH    = 1643.25;   // Cash & equivalents ₹L
export const SHARES  = 1000000;   // Total shares outstanding

export const DEFAULT_PARAMS = {
  tgrPct:  5.0,
  waccPct: 9.6,
  dlomPct: 30,
};

/**
 * @param {{ tgrPct: number, waccPct: number, dlomPct: number }} params
 */
export function calcDCF({ tgrPct, waccPct, dlomPct }) {
  const r = waccPct / 100;
  const g = tgrPct  / 100;

  const rows = PERIODS.map((period, i) => {
    const df = 1 / Math.pow(1 + r, period);
    const pv = FCFFS[i] * df;
    return { year: YEARS[i], fcff: FCFFS[i], period, df, pv };
  });

  const explicitPV  = rows.reduce((s, row) => s + row.pv, 0);
  const lastDf      = rows[rows.length - 1].df;
  const tvNominal   = FCFFS[FCFFS.length - 1] * (1 + g) / (r - g);
  const tvPV        = tvNominal * lastDf;
  const ev          = explicitPV + tvPV;
  const dlomAdj     = ev * (dlomPct / 100);
  const netEV       = ev - dlomAdj;
  const netEquity   = netEV - LTD + CASH;
  const vps         = netEquity * (100000 / SHARES); // ₹L → ₹ per share

  return { rows, explicitPV, tvPV, ev, dlomAdj, netEV, netEquity, vps };
}

/**
 * Build sensitivity matrix: TGR (rows) × WACC (cols) → VPS, at fixed DLOM.
 */
export const MATRIX_TGR  = [2, 3, 4, 5, 6, 7];
export const MATRIX_WACC = [8, 9, 10, 11, 12, 13];

export function buildMatrix(dlomPct) {
  return MATRIX_TGR.map(tgr =>
    MATRIX_WACC.map(wacc =>
      calcDCF({ tgrPct: tgr, waccPct: wacc, dlomPct }).vps
    )
  );
}

/**
 * Build line-chart data: VPS vs TGR at three WACC levels (current ± 1.5%).
 */
export function buildSensLines(waccPct, dlomPct) {
  const TGR_STEPS = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];
  const w0 = +waccPct.toFixed(1);
  const w1 = +Math.max(7,  (waccPct - 1.5)).toFixed(1);
  const w2 = +Math.min(13, (waccPct + 1.5)).toFixed(1);
  const lines = [...new Set([w1, w0, w2])].sort((a, b) => a - b);

  const data = TGR_STEPS.map(tgr => {
    const pt = { tgr };
    lines.forEach(w => { pt[`w${w}`] = +calcDCF({ tgrPct: tgr, waccPct: w, dlomPct }).vps.toFixed(2); });
    return pt;
  });

  return { lines, data };
}

// ─── Formatters ────────────────────────────────────────────────────────────────
const IN = (n, d) => n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmt = {
  L:   (n, d = 0) => '₹' + IN(n, d) + ' L',
  rs:  (n, d = 0) => '₹' + IN(n, d),
  pct: (n, d = 2) => n.toFixed(d) + '%',
  num: (n, d = 4) => IN(n, d),
};
