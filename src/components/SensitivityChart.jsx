import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';

const LINE_COLORS = ['#B0CDE8', '#185FA5', '#0C447C'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>TGR {label}%</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.stroke, marginBottom: 3, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>WACC {p.name}%</span>
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
            ₹{p.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function SensitivityChart({ sensLines, params }) {
  const { lines, data } = sensLines;
  const colors = lines.length === 3 ? LINE_COLORS : ['#B0CDE8', '#185FA5'];

  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>
        Value Per Share  ·  TGR vs WACC Sensitivity
      </h2>
      <p style={{ fontSize: 12, color: '#888780', marginBottom: 14 }}>
        DLOM fixed at {params.dlomPct}%  ·  lines at WACC ± 1.5% around current selection
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {lines.map((w, i) => (
          <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{
              width: 22, height: 3, borderRadius: 2,
              background: colors[i] || '#185FA5',
              display: 'inline-block',
            }} />
            <span style={{ color: '#5f5e5a' }}>WACC {w.toFixed(1)}%</span>
            {w === +params.waccPct.toFixed(1) && (
              <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>current</span>
            )}
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 20, bottom: 24, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="tgr"
            tickFormatter={v => v + '%'}
            tick={{ fontSize: 11, fill: '#888780' }}
            label={{ value: 'Terminal Growth Rate (TGR)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#888780' }}
          />
          <YAxis
            tickFormatter={v => '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            tick={{ fontSize: 11, fill: '#888780' }}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Current TGR reference */}
          <ReferenceLine
            x={+params.tgrPct.toFixed(1)}
            stroke="#185FA5"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: `TGR ${params.tgrPct.toFixed(1)}%`, position: 'insideTopRight', fontSize: 10, fill: '#185FA5' }}
          />

          {lines.map((w, i) => (
            <Line
              key={w}
              type="monotone"
              dataKey={`w${w}`}
              name={w.toFixed(1)}
              stroke={colors[i] || '#185FA5'}
              strokeWidth={w === +params.waccPct.toFixed(1) ? 2.5 : 1.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
