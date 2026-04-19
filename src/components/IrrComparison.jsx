import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const SCENARIO_COLORS = {
  green: '#0F6E56',
  blue:  '#185FA5',
  amber: '#BA7517',
  red:   '#A32D2D',
};

const SHORT_LABELS = {
  green: 'Best',
  blue:  'Optimal',
  amber: 'Mixed',
  red:   'Worst',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>{d.payload.fullLabel}</div>
      <div style={{ color: d.fill, fontWeight: 600 }}>IRR: {d.value.toFixed(1)}%</div>
      <div style={{ color: '#5f5e5a', marginTop: 3 }}>MOIC: {d.payload.moic}</div>
    </div>
  );
};

export default function IrrComparison({ scenarios, params }) {
  const isActive = s => s.ratch === params.ratchetTriggered && s.supp === params.supplierDeal;

  const data = scenarios.map(s => ({
    name: SHORT_LABELS[s.color],
    irr: +s.result.irrPct.toFixed(1),
    color: s.color,
    fullLabel: s.label,
    moic: s.result.moic.toFixed(2) + 'x',
    active: isActive(s),
  }));

  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>
        IRR by Scenario
      </h2>
      <p style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 16 }}>
        Approximate IRR (CAGR of MOIC) across all four scenarios
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 16 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f5e5a' }} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="irr" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={SCENARIO_COLORS[d.color]}
                stroke={d.active ? '#1a1a18' : 'none'}
                strokeWidth={d.active ? 2 : 0}
              />
            ))}
            <LabelList dataKey="irr" position="top" formatter={v => `${v}%`} style={{ fontSize: 12, fontWeight: 700, fill: '#1a1a18' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
