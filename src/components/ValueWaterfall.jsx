import { LTD, CASH, fmt } from '../lib/dcfModel';

const COLORS = {
  add:   '#185FA5',
  sub:   '#A32D2D',
  total: '#042C53',
  dlom:  '#BA7517',
  cash:  '#0F6E56',
};

const LEGEND = [
  { label: 'Addition',  color: COLORS.add   },
  { label: 'Deduction', color: COLORS.sub   },
  { label: 'DLOM',      color: COLORS.dlom  },
  { label: 'Cash',      color: COLORS.cash  },
  { label: 'Subtotal',  color: COLORS.total },
];

export default function ValueWaterfall({ result, params }) {
  const { explicitPV, tvPV, ev, dlomAdj, netEV, netEquity } = result;

  const steps = [
    { name: 'Explicit Period PV', base: 0,            size: explicitPV, type: 'add',   sign: '+'  },
    { name: 'Terminal Value PV',  base: explicitPV,   size: tvPV,       type: 'add',   sign: '+'  },
    { name: 'Enterprise Value',   base: 0,            size: ev,         type: 'total', sign: ''   },
    { name: `DLOM (${params.dlomPct}%)`, base: ev - dlomAdj, size: dlomAdj, type: 'dlom', sign: '−' },
    { name: 'LT Borrowings',      base: netEV - LTD,  size: LTD,        type: 'sub',   sign: '−'  },
    { name: 'Cash & Equiv.',      base: netEV - LTD,  size: CASH,       type: 'cash',  sign: '+'  },
    { name: 'Net Equity Value',   base: 0,            size: netEquity,  type: 'total', sign: ''   },
  ];

  const maxVal = ev * 1.02; // domain max — EV is always the widest bar

  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>
        Value Bridge
      </h2>
      <p style={{ fontSize: 12, color: '#888780', marginBottom: 14 }}>
        EV to net equity build-up · all values in ₹ Lakhs
      </p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
            <span style={{ color: '#888780' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s, i) => {
          const color      = COLORS[s.type];
          const offsetPct  = (s.base / maxVal) * 100;
          const widthPct   = (s.size / maxVal) * 100;
          const isTotal    = s.type === 'total';
          const valueLabel = s.sign + '₹' + Math.round(s.size).toLocaleString('en-IN') + ' L';

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Row label */}
              <div style={{
                width: 140, flexShrink: 0, textAlign: 'right',
                fontSize: 12,
                fontWeight: isTotal ? 700 : 400,
                color: isTotal ? '#1a1a18' : '#5f5e5a',
              }}>
                {s.name}
              </div>

              {/* Bar track */}
              <div style={{ flex: 1, position: 'relative', height: 26 }}>
                {/* Invisible offset spacer */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: offsetPct + '%',
                }} />
                {/* Visible bar */}
                <div style={{
                  position: 'absolute',
                  left: offsetPct + '%',
                  width: Math.max(widthPct, 0.3) + '%',
                  height: '100%',
                  background: color,
                  borderRadius: '0 4px 4px 0',
                  transition: 'width 0.25s ease, left 0.25s ease',
                  minWidth: 4,
                }} />
              </div>

              {/* Value label */}
              <div style={{
                width: 110, flexShrink: 0,
                fontSize: 12,
                fontWeight: isTotal ? 700 : 600,
                color: s.sign === '−' ? color : isTotal ? color : '#1a1a18',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}>
                {valueLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis tick labels */}
      <div style={{ display: 'flex', marginLeft: 150, marginTop: 8, paddingRight: 110 }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const v = t * maxVal;
          return (
            <div key={t} style={{
              flex: 1, textAlign: t === 0 ? 'left' : t === 1 ? 'right' : 'center',
              fontSize: 10, color: '#b0aea8',
            }}>
              ₹{(v / 1000).toFixed(0)}k
            </div>
          );
        })}
      </div>
    </section>
  );
}
