import {
  BarChart, Bar, XAxis, YAxis, Cell, LabelList, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { LTD, CASH, fmt } from '../lib/dcfModel';

const COLORS = {
  add:   '#185FA5',
  sub:   '#A32D2D',
  total: '#042C53',
  dlom:  '#BA7517',
  cash:  '#0F6E56',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: d.labelColor, fontWeight: 600 }}>{d.sign}{fmt.L(d.rawVal, 2)}</div>
      {d.type !== 'total' && <div style={{ color: '#888780', marginTop: 2, fontSize: 11 }}>{d.desc}</div>}
    </div>
  );
};

export default function ValueWaterfall({ result, params }) {
  const { explicitPV, tvPV, ev, dlomAdj, netEV, netEquity } = result;

  // Floating waterfall: each bar has an invisible offset (base) + visible segment (size)
  const steps = [
    {
      name: 'Explicit Period PV',
      base: 0, size: explicitPV, rawVal: explicitPV,
      type: 'add', sign: '+', desc: 'Sum of discounted FCFFs (FY27–31)',
      labelColor: COLORS.add,
    },
    {
      name: 'Terminal Value PV',
      base: explicitPV, size: tvPV, rawVal: tvPV,
      type: 'add', sign: '+', desc: `FCFF₅ × (1 + ${params.tgrPct}%) / (${params.waccPct.toFixed(1)}% − ${params.tgrPct}%) × DF`,
      labelColor: COLORS.add,
    },
    {
      name: 'Enterprise Value',
      base: 0, size: ev, rawVal: ev,
      type: 'total', sign: '', desc: '',
      labelColor: COLORS.total,
    },
    {
      name: `DLOM  (${params.dlomPct}%)`,
      base: ev - dlomAdj, size: dlomAdj, rawVal: dlomAdj,
      type: 'dlom', sign: '−', desc: 'Discount for lack of marketability',
      labelColor: COLORS.dlom,
    },
    {
      name: 'LT Borrowings',
      base: netEV - LTD, size: LTD, rawVal: LTD,
      type: 'sub', sign: '−', desc: 'Long-term debt deducted from EV',
      labelColor: COLORS.sub,
    },
    {
      name: 'Cash & Equiv.',
      base: netEV - LTD, size: CASH, rawVal: CASH,
      type: 'cash', sign: '+', desc: 'Cash added back to net equity',
      labelColor: COLORS.cash,
    },
    {
      name: 'Net Equity Value',
      base: 0, size: netEquity, rawVal: netEquity,
      type: 'total', sign: '', desc: '',
      labelColor: COLORS.total,
    },
  ];

  const typeColor = { add: COLORS.add, sub: COLORS.sub, total: COLORS.total, dlom: COLORS.dlom, cash: COLORS.cash };

  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>
        Value Bridge
      </h2>
      <p style={{ fontSize: 12, color: '#888780', marginBottom: 16 }}>
        EV to net equity build-up  ·  all values in ₹ Lakhs
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Addition', color: COLORS.add },
          { label: 'Deduction', color: COLORS.sub },
          { label: 'DLOM', color: COLORS.dlom },
          { label: 'Cash', color: COLORS.cash },
          { label: 'Subtotal', color: COLORS.total },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
            <span style={{ color: '#888780' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={steps}
          layout="vertical"
          margin={{ top: 4, right: 90, bottom: 4, left: 130 }}
          barSize={24}
        >
          <XAxis
            type="number"
            domain={[0, 'auto']}
            tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'}
            tick={{ fontSize: 10, fill: '#888780' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={136}
            tick={{ fontSize: 12, fill: '#5f5e5a' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />

          {/* Invisible offset bar */}
          <Bar dataKey="base" stackId="wf" fill="transparent" stroke="none" isAnimationActive={false} />

          {/* Visible bar */}
          <Bar dataKey="size" stackId="wf" radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {steps.map((s, i) => (
              <Cell key={i} fill={typeColor[s.type]} />
            ))}
            <LabelList
              content={(props) => {
                const { x, y, width, height, value, index } = props;
                const s = steps[index];
                if (!s || value == null) return null;
                const label = s.sign + (s.sign ? '' : '') + '₹' + Math.round(s.rawVal).toLocaleString('en-IN') + ' L';
                return (
                  <text
                    x={x + width + 6}
                    y={y + height / 2}
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#1a1a18"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {label}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
