import { fmt } from '../lib/dealModel';

const colors = {
  green: { bg: '#EAF3DE', border: '#0F6E56', accent: '#27500A', tag: '#0F6E56' },
  blue:  { bg: '#E6F1FB', border: '#185FA5', accent: '#0C447C', tag: '#185FA5' },
  amber: { bg: '#FAEEDA', border: '#BA7517', accent: '#633806', tag: '#BA7517' },
  red:   { bg: '#FCEBEB', border: '#A32D2D', accent: '#791F1F', tag: '#A32D2D' },
};

function ScenarioCard({ scenario, isActive, params }) {
  const c = colors[scenario.color];
  const r = scenario.result;

  const rows = [
    ['Entry price', fmt.rs(r.actualEqPrice)],
    ['Equity stake', fmt.pct(r.eqStakePct)],
    ['Note discount', fmt.pct(r.convDiscPct)],
    ['Conv. price', fmt.rs(r.convPricePerShare)],
    ['Note shares', fmt.num(r.noteShares)],
    ['Total post-A stake', fmt.pct(r.totalStakePct)],
    ['Annual interest', fmt.cr(r.annualInterestCr)],
    ['Total return', fmt.cr(r.totalReturnCr)],
    ['MOIC', fmt.moic(r.moic)],
    ['IRR', fmt.pct(r.irrPct)],
    ['Seller dilution', fmt.pct(r.sellerDilutionPct)],
  ];

  return (
    <div style={{
      background: c.bg,
      border: `${isActive ? 2 : 1}px solid ${isActive ? '#185FA5' : c.border}`,
      borderRadius: 12,
      padding: '16px',
      position: 'relative',
      boxShadow: isActive ? '0 0 0 3px rgba(24,95,165,0.15)' : 'none',
    }}>
      {isActive && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: '#185FA5', color: 'white', fontSize: 10, fontWeight: 700,
          padding: '2px 10px', borderRadius: 10, letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
        }}>CURRENT SCENARIO</div>
      )}
      <div style={{
        fontSize: 10, fontWeight: 700, color: c.tag,
        textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8,
      }}>
        {scenario.color === 'green' ? '● Best' : scenario.color === 'blue' ? '● Optimal' : scenario.color === 'amber' ? '● Mixed' : '● Worst'}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.accent, marginBottom: 12, lineHeight: 1.4 }}>
        {scenario.label.split('—')[1]?.trim()}
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 12, padding: '4px 0',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <span style={{ color: '#5f5e5a' }}>{k}</span>
          <span style={{ fontWeight: 600, color: c.accent }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function ScenarioMatrix({ scenarios, params }) {
  const isActive = (s) =>
    s.ratch === params.ratchetTriggered && s.supp === params.supplierDeal;

  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', marginBottom: 16 }}>
        Scenario Matrix
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }} className="scenario-grid">
        {scenarios.map(s => (
          <ScenarioCard key={s.color} scenario={s} isActive={isActive(s)} params={params} />
        ))}
      </div>

      {/* Full comparison table */}
      <div style={{ marginTop: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#042C53', color: 'white' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderRadius: '8px 0 0 0' }}>Metric</th>
              {scenarios.map(s => (
                <th key={s.color} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600,
                  background: isActive(s) ? '#185FA5' : '#042C53',
                  borderBottom: isActive(s) ? '3px solid #4DA3FF' : 'none',
                }}>
                  {s.color.charAt(0).toUpperCase() + s.color.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Entry price', r => fmt.rs(r.actualEqPrice)],
              ['Equity stake %', r => fmt.pct(r.eqStakePct)],
              ['Note discount %', r => fmt.pct(r.convDiscPct)],
              ['Conv. price', r => fmt.rs(r.convPricePerShare)],
              ['Note shares', r => fmt.num(r.noteShares)],
              ['Total post-A stake', r => fmt.pct(r.totalStakePct)],
              ['Annual interest', r => fmt.cr(r.annualInterestCr)],
              ['Total interest', r => fmt.cr(r.totalInterestCr)],
              ['Eq. value at IPO', r => fmt.cr(r.eqValueAtIPOCr)],
              ['Note value at IPO', r => fmt.cr(r.noteValueAtIPOCr)],
              ['Total return', r => fmt.cr(r.totalReturnCr)],
              ['MOIC', r => fmt.moic(r.moic)],
              ['IRR', r => fmt.pct(r.irrPct)],
              ['Seller dilution', r => fmt.pct(r.sellerDilutionPct)],
            ].map(([label, fn], i) => (
              <tr key={label} style={{ background: i % 2 === 0 ? '#F8F7F4' : 'white' }}>
                <td style={{ padding: '8px 12px', color: '#5f5e5a', fontWeight: 500 }}>{label}</td>
                {scenarios.map(s => (
                  <td key={s.color} style={{
                    padding: '8px 12px', textAlign: 'right', fontWeight: 600,
                    color: isActive(s) ? '#185FA5' : '#1a1a18',
                    background: isActive(s) ? 'rgba(24,95,165,0.05)' : 'transparent',
                  }}>
                    {fn(s.result)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
