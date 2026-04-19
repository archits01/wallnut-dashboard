import { FCFFS, YEARS, LTD, CASH, SHARES, fmt } from '../lib/dcfModel';

function SliderRow({ label, value, min, max, step, onChange, display }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#5f5e5a', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a18', fontVariantNumeric: 'tabular-nums' }}>
          {display(value)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 10, color: '#b0aea8' }}>{display(min)}</span>
        <span style={{ fontSize: 10, color: '#b0aea8' }}>{display(max)}</span>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
      color: '#888780', borderBottom: '1px solid rgba(0,0,0,0.07)',
      paddingBottom: 6, marginBottom: 14, marginTop: 22,
    }}>{children}</div>
  );
}

export default function DCFSidebar({ params, onParam }) {
  return (
    <aside style={{
      width: 270, flexShrink: 0,
      background: 'white',
      borderRight: '1px solid rgba(0,0,0,0.09)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        padding: '20px 20px 16px',
        background: '#042C53', color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>
          Wallnut Building Solutions
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>DCF Valuation</div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 3 }}>Interactive sensitivity analysis</div>
      </div>

      <div style={{ padding: '4px 20px 20px', flex: 1 }}>

        <SectionLabel>Valuation Parameters</SectionLabel>

        <SliderRow
          label="Terminal Growth Rate (TGR)"
          value={params.tgrPct}
          min={2} max={7} step={0.1}
          onChange={onParam('tgrPct')}
          display={v => v.toFixed(1) + '%'}
        />
        <SliderRow
          label="WACC"
          value={params.waccPct}
          min={7} max={13} step={0.1}
          onChange={onParam('waccPct')}
          display={v => (+v).toFixed(1) + '%'}
        />
        <SliderRow
          label="DLOM — Discount for Lack of Marketability"
          value={params.dlomPct}
          min={0} max={40} step={1}
          onChange={onParam('dlomPct')}
          display={v => v + '%'}
        />

        {/* Formula note */}
        <div style={{
          background: '#F8F7F4', borderRadius: 6, padding: '10px 12px',
          fontSize: 11, color: '#888780', lineHeight: 1.7, marginTop: 4, marginBottom: 4,
          fontFamily: 'ui-monospace, monospace',
        }}>
          <div>TV = FCFF₅ × (1+g) / (r−g)</div>
          <div>EV = Σ PV(FCFF) + PV(TV)</div>
          <div>Equity = EV×(1−DLOM) − Debt + Cash</div>
        </div>

        <SectionLabel>Projected FCFFs (₹ Lakhs) — Fixed</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {YEARS.map((yr, i) => (
            <div key={yr} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, padding: '6px 10px', borderRadius: 6,
              background: '#F8F7F4',
            }}>
              <span style={{ color: '#5f5e5a', fontWeight: 500 }}>{yr}</span>
              <span style={{ fontWeight: 700, color: '#1a1a18', fontVariantNumeric: 'tabular-nums' }}>
                {fmt.L(FCFFS[i], 2)}
              </span>
            </div>
          ))}
        </div>

        <SectionLabel>Balance Sheet Inputs — Fixed</SectionLabel>

        {[
          ['LT Borrowings', fmt.L(LTD, 2)],
          ['Cash & Equivalents', fmt.L(CASH, 2)],
          ['Shares Outstanding', (SHARES / 100000).toFixed(0) + ' L'],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 12, padding: '6px 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}>
            <span style={{ color: '#5f5e5a' }}>{k}</span>
            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{v}</span>
          </div>
        ))}

      </div>

      <div style={{
        padding: '10px 20px', borderTop: '1px solid rgba(0,0,0,0.07)',
        fontSize: 10, color: '#b0aea8', textAlign: 'center', flexShrink: 0,
      }}>
        For discussion purposes only
      </div>
    </aside>
  );
}
