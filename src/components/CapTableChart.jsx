import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  'Promoters / existing': '#888780',
  'Investor (equity)': '#185FA5',
  'Investor (note conversion)': '#534AB7',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#1a1a18' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: COLORS[p.name] || '#333', marginBottom: 3 }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span> {p.value.toFixed(1)}%
        </div>
      ))}
    </div>
  );
};

export default function CapTableChart({ capTable }) {
  const chartData = capTable.map(stage => {
    const row = { stage: stage.stage };
    stage.holders.forEach(h => { row[h.name] = +h.stakePct.toFixed(1); });
    return row;
  });

  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>
        Cap Table Waterfall
      </h2>
      <p style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 16 }}>
        Ownership progression from pre-investment through Series A conversion
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(COLORS).map(([name, color]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ color: '#5f5e5a' }}>{name}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 40, left: 16 }}>
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#5f5e5a' }} angle={-10} textAnchor="end" interval={0} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Promoters / existing" stackId="a" fill="#888780" name="Promoters / existing" radius={[0, 0, 4, 4]}>
            <LabelList dataKey="Promoters / existing" position="center" formatter={v => v > 5 ? `${v.toFixed(0)}%` : ''} fill="white" style={{ fontSize: 11, fontWeight: 600 }} />
          </Bar>
          <Bar dataKey="Investor (equity)" stackId="a" fill="#185FA5" name="Investor (equity)">
            <LabelList dataKey="Investor (equity)" position="center" formatter={v => v > 3 ? `${v.toFixed(0)}%` : ''} fill="white" style={{ fontSize: 11, fontWeight: 600 }} />
          </Bar>
          <Bar dataKey="Investor (note conversion)" stackId="a" fill="#534AB7" name="Investor (note conversion)" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="Investor (note conversion)" position="center" formatter={v => v > 3 ? `${v.toFixed(0)}%` : ''} fill="white" style={{ fontSize: 11, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
