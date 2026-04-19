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

      {/* Value build-up below table */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14,
      }} className="bridge-grid">
        {[
          { label: 'Explicit Period PV', value: fmt.L(explicitPV, 2), sign: '+', color: '#185FA5' },
          { label: 'Terminal Value PV',  value: fmt.L(tvPV, 2),        sign: '+', color: '#185FA5' },
          { label: 'Enterprise Value',   value: fmt.L(ev, 2),           sign: '=', color: '#042C53' },
          { label: `DLOM (${params.dlomPct}%)`, value: fmt.L(dlomAdj, 2), sign: '−', color: '#A32D2D' },
          { label: 'LT Borrowings',      value: fmt.L(LTD, 2),          sign: '−', color: '#A32D2D' },
          { label: 'Cash & Equiv.',       value: fmt.L(CASH, 2),         sign: '+', color: '#0F6E56' },
        ].map(item => (
          <div key={item.label} style={{
            background: '#F8F7F4', borderRadius: 8, padding: '10px 12px',
            border: `1px solid ${item.sign === '=' ? item.color : 'rgba(0,0,0,0.06)'}`,
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#888780', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                {item.sign !== '+' && item.sign !== '=' ? item.sign : ''}{item.sign === '+' ? '' : ''}{item.value}
              </span>
            </div>
            <div style={{ fontSize: 10, color: item.color, fontWeight: 500 }}>
              {item.sign === '+' ? 'Addition' : item.sign === '−' ? 'Deduction' : 'Subtotal'}
            </div>
          </div>
        ))}
      </div>

      {/* Net equity result */}
      <div style={{
        marginTop: 10, background: '#042C53', borderRadius: 8, padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>
            Net Equity Value
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            EV × (1 − {params.dlomPct}%) − {fmt.L(LTD, 2)} + {fmt.L(CASH, 2)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
            {fmt.L(netEquity, 2)}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Value per share: <strong style={{ color: 'white' }}>₹{netEquity > 0 ? (netEquity * 0.1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
