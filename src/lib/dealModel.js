/**
 * Wallnut Deal Model — Core Calculation Engine
 * Drop this file into your React project at src/lib/dealModel.js
 * All functions are pure — no side effects, no DOM, fully testable.
 *
 * Key concepts:
 *   - ₹1 Cr = ₹10,000,000 (1e7) — all internal calculations in rupees
 *   - Shares are integers (Math.round throughout)
 *   - IRR is approximated as CAGR of MOIC (suitable for single-exit cashflow)
 *   - DLOM = Discount for Lack of Marketability (affects equity valuation only)
 */

// ─────────────────────────────────────────────
// TYPES (JSDoc for IDE autocomplete)
// ─────────────────────────────────────────────

/**
 * @typedef {Object} DealParams
 * @property {number} eqAmtCr          - Equity tranche amount in ₹ Cr (default: 20)
 * @property {number} eqPricePerShare   - Entry price per share in ₹ (default: 1554)
 * @property {number} ratchetPrice      - Ratchet-triggered price per share in ₹ (default: 1318)
 * @property {number} preMoneyShares    - Existing shares before this round (default: 1000000)
 * @property {number} noteAmtCr         - Convertible note amount in ₹ Cr (default: 22)
 * @property {number} couponPct         - Note coupon rate % p.a. (default: 8)
 * @property {number} baseDiscPct       - Base Series A conversion discount % (default: 10)
 * @property {number} supplierDiscPct   - Enhanced discount % if supplier deal achieved (default: 20)
 * @property {number} seriesAPricePerShare - Expected Series A price per share ₹ (default: 2000)
 * @property {number} ipoValCr          - Expected IPO valuation ₹ Cr (default: 250)
 * @property {number} exitMonths        - Months from investment to exit/IPO (default: 36)
 * @property {number} dlomPct           - DLOM % applied to private equity valuation (default: 22)
 * @property {number} tgrPct            - Terminal growth rate % for DCF (default: 5)
 * @property {number} fy27RevTarget     - FY27 revenue threshold ₹ L for ratchet (default: 1560)
 * @property {number} fy28EbitdaTarget  - FY28 EBITDA threshold ₹ L for ratchet (default: 350)
 * @property {boolean} ratchetTriggered - Whether projections were missed
 * @property {boolean} supplierDeal     - Whether supplier deal was achieved
 */

/**
 * @typedef {Object} ScenarioResult
 * @property {number} actualEqPrice       - Effective equity price (base or ratchet)
 * @property {number} newEquityShares     - Shares issued in equity tranche
 * @property {number} ratchetBonusShares  - Extra shares from ratchet (0 if not triggered)
 * @property {number} totalInvestorShares - newEquityShares + ratchetBonusShares
 * @property {number} postMoneyShares     - Total shares after equity tranche
 * @property {number} eqStakePct          - Investor equity stake % post-money
 * @property {number} convDiscPct         - Actual conversion discount applied
 * @property {number} convPricePerShare   - Note conversion price per share
 * @property {number} noteShares          - Shares issued on note conversion at Series A
 * @property {number} postAShares         - Total shares after Series A conversion
 * @property {number} totalStakePct       - Combined investor stake % post-Series A
 * @property {number} sellerDilutionPct   - Equivalent to totalStakePct (seller's dilution)
 * @property {number} annualInterestCr    - Annual coupon income ₹ Cr
 * @property {number} totalInterestCr     - Total interest over tenor ₹ Cr
 * @property {number} preMoneyEVCr        - Implied pre-money enterprise value ₹ Cr
 * @property {number} totalCapitalCr      - Total capital deployed ₹ Cr (eq + note)
 * @property {number} eqValueAtIPOCr      - Equity tranche value at IPO ₹ Cr
 * @property {number} noteValueAtIPOCr    - Note-converted shares value at IPO ₹ Cr
 * @property {number} totalReturnCr       - Total return (eq + note + interest) ₹ Cr
 * @property {number} moic                - Multiple on invested capital
 * @property {number} irrPct              - Approximate IRR % (CAGR of MOIC)
 * @property {number} eqReturnSharePct    - % of total return from equity
 * @property {number} noteReturnSharePct  - % of total return from note conversion
 * @property {number} interestSharePct    - % of total return from interest income
 */

// ─────────────────────────────────────────────
// DEFAULT PARAMETERS
// ─────────────────────────────────────────────

export const DEFAULT_PARAMS = {
  eqAmtCr: 20,
  eqPricePerShare: 1554,
  ratchetPrice: 1318,
  preMoneyShares: 1000000,
  noteAmtCr: 22,
  couponPct: 8,
  baseDiscPct: 10,
  supplierDiscPct: 20,
  seriesAPricePerShare: 2000,
  ipoValCr: 250,
  exitMonths: 36,
  dlomPct: 22,
  tgrPct: 5,
  fy27RevTarget: 1560,
  fy28EbitdaTarget: 350,
  ratchetTriggered: false,
  supplierDeal: false,
};

// ─────────────────────────────────────────────
// CORE CALCULATION
// ─────────────────────────────────────────────

/**
 * Calculate full deal outcome for a given set of parameters.
 * Can be called with overrides to model ratchet/supplier variants.
 *
 * @param {DealParams} params
 * @param {boolean} [ratchetOverride] - Override ratchetTriggered for scenario modelling
 * @param {boolean} [supplierOverride] - Override supplierDeal for scenario modelling
 * @returns {ScenarioResult}
 */
export function calcDeal(params, ratchetOverride, supplierOverride) {
  const ratchet = ratchetOverride !== undefined ? ratchetOverride : params.ratchetTriggered;
  const supplier = supplierOverride !== undefined ? supplierOverride : params.supplierDeal;

  const {
    eqAmtCr, eqPricePerShare, ratchetPrice, preMoneyShares,
    noteAmtCr, couponPct, baseDiscPct, supplierDiscPct,
    seriesAPricePerShare, ipoValCr, exitMonths,
  } = params;

  // Equity tranche
  const actualEqPrice = ratchet ? ratchetPrice : eqPricePerShare;
  const newEquityShares = Math.round((eqAmtCr * 1e7) / actualEqPrice);
  // Ratchet bonus: difference between what shares should have been issued at ratchet price vs base
  const ratchetBonusShares = ratchet
    ? Math.max(0, Math.round((eqAmtCr * 1e7) / ratchetPrice) - Math.round((eqAmtCr * 1e7) / eqPricePerShare))
    : 0;
  const totalInvestorShares = newEquityShares + ratchetBonusShares;
  const postMoneyShares = preMoneyShares + totalInvestorShares;
  const eqStakePct = (totalInvestorShares / postMoneyShares) * 100;

  // Convertible note
  const convDiscPct = supplier ? supplierDiscPct : baseDiscPct;
  const convPricePerShare = seriesAPricePerShare * (1 - convDiscPct / 100);
  const noteShares = Math.round((noteAmtCr * 1e7) / convPricePerShare);
  const postAShares = postMoneyShares + noteShares;
  const totalStakePct = ((totalInvestorShares + noteShares) / postAShares) * 100;
  const sellerDilutionPct = totalStakePct;

  // Income
  const annualInterestCr = noteAmtCr * (couponPct / 100);
  const totalInterestCr = annualInterestCr * (exitMonths / 12);

  // Valuation
  const preMoneyEVCr = (preMoneyShares * actualEqPrice) / 1e7;
  const totalCapitalCr = eqAmtCr + noteAmtCr;

  // Returns at IPO
  const eqValueAtIPOCr = (totalInvestorShares / postAShares) * ipoValCr;
  const noteValueAtIPOCr = (noteShares / postAShares) * ipoValCr;
  const totalReturnCr = eqValueAtIPOCr + noteValueAtIPOCr + totalInterestCr;

  const moic = totalReturnCr / totalCapitalCr;
  const years = exitMonths / 12;
  const irrPct = (Math.pow(moic, 1 / years) - 1) * 100;

  // Return attribution
  const eqReturnSharePct = (eqValueAtIPOCr / totalReturnCr) * 100;
  const noteReturnSharePct = (noteValueAtIPOCr / totalReturnCr) * 100;
  const interestSharePct = (totalInterestCr / totalReturnCr) * 100;

  return {
    actualEqPrice, newEquityShares, ratchetBonusShares, totalInvestorShares,
    postMoneyShares, eqStakePct, convDiscPct, convPricePerShare,
    noteShares, postAShares, totalStakePct, sellerDilutionPct,
    annualInterestCr, totalInterestCr, preMoneyEVCr, totalCapitalCr,
    eqValueAtIPOCr, noteValueAtIPOCr, totalReturnCr,
    moic, irrPct, eqReturnSharePct, noteReturnSharePct, interestSharePct,
  };
}

// ─────────────────────────────────────────────
// SCENARIO MATRIX
// ─────────────────────────────────────────────

/**
 * Returns all four canonical scenarios for the outcome matrix table.
 * @param {DealParams} params
 * @returns {Array<{label: string, color: string, result: ScenarioResult}>}
 */
export function calcAllScenarios(params) {
  return [
    { label: 'Best — projections met, no supplier deal',    color: 'green',  ratch: false, supp: false },
    { label: 'Optimal — projections met + supplier deal',   color: 'blue',   ratch: false, supp: true  },
    { label: 'Mixed — projections missed + supplier deal',  color: 'amber',  ratch: true,  supp: true  },
    { label: 'Worst — projections missed, no supplier deal',color: 'red',    ratch: true,  supp: false },
  ].map(s => ({
    ...s,
    result: calcDeal(params, s.ratch, s.supp),
  }));
}

// ─────────────────────────────────────────────
// DLOM SENSITIVITY
// ─────────────────────────────────────────────

/**
 * Returns how the implied equity price changes across a range of DLOM values.
 * Uses DCF formula: Price = (EBITDA / (WACC - TGR)) * (1 - DLOM/100)
 *
 * @param {number} ebitdaCr   - Normalised EBITDA ₹ Cr
 * @param {number} waccPct    - WACC %
 * @param {number} tgrPct     - Terminal growth rate %
 * @param {number} totalShares - Total shares for per-share price
 * @returns {Array<{dlom: number, evCr: number, pricePerShare: number}>}
 */
export function dlomSensitivity(ebitdaCr, waccPct, tgrPct, totalShares) {
  const dlomRange = [0, 5, 10, 15, 20, 22, 25, 30, 35, 40];
  const wacc = waccPct / 100;
  const tgr = tgrPct / 100;
  return dlomRange.map(dlom => {
    const evCr = (ebitdaCr / (wacc - tgr)) * (1 - dlom / 100);
    const pricePerShare = (evCr * 1e7) / totalShares;
    return { dlom, evCr: Math.round(evCr * 100) / 100, pricePerShare: Math.round(pricePerShare) };
  });
}

// ─────────────────────────────────────────────
// CAP TABLE WATERFALL
// ─────────────────────────────────────────────

/**
 * Returns the full cap table at each stage of the deal.
 * @param {DealParams} params
 * @returns {Array<{stage: string, holders: Array<{name: string, shares: number, stakePct: number}>}>}
 */
export function capTableWaterfall(params) {
  const r = calcDeal(params);

  const preMoneyPromoter = params.preMoneyShares;

  const postEquityTotal = params.preMoneyShares + r.totalInvestorShares;
  const postATotal = postEquityTotal + r.noteShares;

  return [
    {
      stage: 'Pre-investment',
      total: preMoneyPromoter,
      holders: [
        { name: 'Promoters / existing', shares: preMoneyPromoter, stakePct: 100 },
      ],
    },
    {
      stage: 'Post equity tranche',
      total: postEquityTotal,
      holders: [
        { name: 'Promoters / existing', shares: preMoneyPromoter, stakePct: (preMoneyPromoter / postEquityTotal) * 100 },
        { name: 'Investor (equity)', shares: r.totalInvestorShares, stakePct: r.eqStakePct },
      ],
    },
    {
      stage: 'Post Series A (note converts)',
      total: postATotal,
      holders: [
        { name: 'Promoters / existing', shares: preMoneyPromoter, stakePct: (preMoneyPromoter / postATotal) * 100 },
        { name: 'Investor (equity)', shares: r.totalInvestorShares, stakePct: (r.totalInvestorShares / postATotal) * 100 },
        { name: 'Investor (note conversion)', shares: r.noteShares, stakePct: (r.noteShares / postATotal) * 100 },
      ],
    },
  ];
}

// ─────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────

export const fmt = {
  /** Format as Indian number with commas */
  num: (n) => Math.round(n).toLocaleString('en-IN'),
  /** Format as ₹ Cr with 2 decimal places */
  cr: (n) => '₹' + n.toFixed(2) + ' Cr',
  /** Format as percentage with 1 decimal place */
  pct: (n) => n.toFixed(1) + '%',
  /** Format as ₹ with Indian commas */
  rs: (n) => '₹' + Math.round(n).toLocaleString('en-IN'),
  /** Format as multiple */
  moic: (n) => n.toFixed(2) + 'x',
};
