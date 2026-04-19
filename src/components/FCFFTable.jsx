import { LTD, CASH, fmt } from '../lib/dcfModel';

export default function FCFFTable({ result, params }) {
  const { rows, explicitPV, tvPV, ev, dlomAdj, netEV, netEquity } = result;

  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>
        Year-by-Year Discounting
      </h2>
      <p style={{ fontSize: 12, color: '#888780', marginBottom: 14 }}>
        WACC {params.waccPct.toFixed(1)}% · mid-year convention
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#F1EFE8' }}>
              {['Year', 'FCFF (₹L)', 'Period', 'Discount Factor', 'PV of FCFF (₹L)'].map((h, i) => (
                <th key={h} style={{
                  padding: '9px 12px', textAlign: i === 0 ? 'left' : 'right',
                  fontWeight: 600, fontSize: 11, color: '#5f5e5a',
                  letterSpacing: '0.3px', textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(0,0,0,0.1)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.year} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8' }}>
                <td style={{ padding: '8px 12px', color: '#1a1a18', fontWeight: 500 }}>{row.year}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#1a1a18', fontVariantNumeric: 'tabular-nums' }}>{fmt.L(row.fcff, 2)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#5f5e5a' }}>{row.period.toFixed(1)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#5f5e5a', fontVariantNumeric: 'tabular-nums' }}>{fmt.num(row.df, 6)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#185FA5', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt.L(row.pv, 2)}</td>
              </tr>
            ))}
            <tr style={{ background: '#E6F1FB' }}>
              <td style={{ padding: '9px 12px', fontWeight: 700, color: '#0C447C' }} colSpan={4}>
                Total Explicit Period PV
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#0C447C', fontVariantNumeric: 'tabular-nums' }}>
                {fmt.L(explicitPV, 2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Value bridge summary */}
      <div style={{ marginTop: 14, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, overflow: 'hidden' }}>
        {[
          { label: 'Explicit Period PV',       value: fmt.L(explicitPV, 2), sign: '+', color: '#185FA5', bg: 'white' },
          { label: 'Terminal Value PV',         value: fmt.L(tvPV, 2),       sign: '+', color: '#185FA5', bg: '#FAFAF8' },
          { label: 'Enterprise Value',          value: fmt.L(ev, 2),         sign: '=', color: '#042C53', bg: '#EEF4FB', bold: true },
          { label: `Less: DLOM (${params.dlomPct}%)`, value: fmt.L(dlomAdj, 2), sign: '−', color: '#A32D2D', bg: 'white' },
          { label: 'Less: LT Borrowings',       value: fmt.L(LTD, 2),        sign: '−', color: '#A32D2D', bg: '#FAFAF8' },
          { label: 'Add: Cash & Equivalents',   value: fmt.L(CASH, 2),       sign: '+', color: '#0F6E56', bg: 'white' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '9px 14px', background: item.bg,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}>
            <span style={{ fontSize: 12, color: item.bold ? '#042C53' : '#5f5e5a', fontWeight: item.bold ? 700 : 400 }}>
              {item.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: item.bold ? 700 : 600, color: item.color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {item.sign === '−' ? '−' : item.sign === '+' && !item.bold ? '+' : ''}{item.value}
            </span>
          </div>
        ))}
        {/* Net equity row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 14px', background: '#042C53',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Net Equity Value</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Value per share: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>
                ₹{netEquity > 0 ? (netEquity * 0.1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
              </strong>
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {fmt.L(netEquity, 2)}
          </div>
        </div>
      </div>
    </section>
  );
}
