import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill, marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span> ₹{p.value.toFixed(2)} Cr ({((p.value / total) * 100).toFixed(1)}%)
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: 6, paddingTop: 6, fontWeight: 700 }}>
        Total: ₹{total.toFixed(2)} Cr
      </div>
    </div>
  );
};

export default function ReturnWaterfall({ result }) {
  const data = [{
    name: 'Return breakdown',
    equity: +result.eqValueAtIPOCr.toFixed(2),
    note: +result.noteValueAtIPOCr.toFixed(2),
    interest: +result.totalInterestCr.toFixed(2),
  }];

  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>
        Return Attribution
      </h2>
      <p style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 16 }}>
        How total return of {result.totalReturnCr > 0 ? '₹' + result.totalReturnCr.toFixed(1) + ' Cr' : '—'} is distributed across pillars
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { key: 'equity', color: '#185FA5', label: 'Equity at IPO', val: result.eqValueAtIPOCr },
          { key: 'note',   color: '#BA7517', label: 'Note conversion at IPO', val: result.noteValueAtIPOCr },
          { key: 'interest', color: '#0F6E56', label: 'Interest income', val: result.totalInterestCr },
        ].map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: item.color, flexShrink: 0 }} />
            <span style={{ color: '#5f5e5a' }}>{item.label}:</span>
            <span style={{ fontWeight: 700, color: item.color }}>₹{item.val.toFixed(1)} Cr</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={90}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 30, bottom: 4, left: 4 }}>
          <XAxis type="number" tickFormatter={v => `₹${v.toFixed(0)}`} tick={{ fontSize: 11 }} />
          <YAxis type="category" hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="equity" stackId="a" fill="#185FA5" name="Equity at IPO" radius={[4, 0, 0, 4]}>
            <LabelList dataKey="equity" position="center" formatter={v => v > 3 ? `₹${v.toFixed(1)}` : ''} fill="white" style={{ fontSize: 11, fontWeight: 600 }} />
          </Bar>
          <Bar dataKey="note" stackId="a" fill="#BA7517" name="Note at IPO">
            <LabelList dataKey="note" position="center" formatter={v => v > 3 ? `₹${v.toFixed(1)}` : ''} fill="white" style={{ fontSize: 11, fontWeight: 600 }} />
          </Bar>
          <Bar dataKey="interest" stackId="a" fill="#0F6E56" name="Interest income" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="interest" position="center" formatter={v => v > 1.5 ? `₹${v.toFixed(1)}` : ''} fill="white" style={{ fontSize: 11, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
