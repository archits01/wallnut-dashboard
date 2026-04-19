import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid, Label,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>DLOM: {d.dlom}%</div>
      <div>Implied price: <strong>₹{Math.round(d.pricePerShare).toLocaleString('en-IN')}</strong></div>
      <div style={{ color: '#5f5e5a', marginTop: 2 }}>EV: ₹{d.evCr.toFixed(1)} Cr</div>
    </div>
  );
};

export default function DlomSensitivity({ dlomData, params }) {
  const entryPrice = params.eqPricePerShare;
  const ratchetPrice = params.ratchetPrice;

  return (
    <section>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>
            DLOM Sensitivity
          </h2>
          <p style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 16 }}>
            Implied share price vs. discount for lack of marketability (DLOM %). Uses live DCF inputs.
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dlomData} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="dlom"
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 11 }}
                label={{ value: 'DLOM %', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#888780' }}
              />
              <YAxis
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* IBBI floor at 0% DLOM */}
              <ReferenceLine
                y={dlomData[0]?.pricePerShare}
                stroke="#888780" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: 'IBBI floor', position: 'right', fontSize: 10, fill: '#888780' }}
              />

              {/* Negotiated entry price */}
              <ReferenceLine
                y={entryPrice}
                stroke="#185FA5" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: 'Negotiated entry', position: 'insideTopRight', fontSize: 10, fill: '#185FA5' }}
              />

              {/* Ratchet price */}
              <ReferenceLine
                y={ratchetPrice}
                stroke="#A32D2D" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: 'Ratchet price', position: 'insideBottomRight', fontSize: 10, fill: '#A32D2D' }}
              />

              {/* Proposed DLOM 22% */}
              <ReferenceLine
                x={22}
                stroke="#BA7517" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: 'Proposed DLOM', position: 'insideTopRight', fontSize: 10, fill: '#BA7517', angle: -90 }}
              />

              {/* Ratchet DLOM 30% */}
              <ReferenceLine
                x={30}
                stroke="#A32D2D" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: 'Ratchet DLOM', position: 'insideTopLeft', fontSize: 10, fill: '#A32D2D', angle: -90 }}
              />

              <Line
                type="monotone"
                dataKey="pricePerShare"
                stroke="#185FA5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#185FA5', stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Annotation card */}
        <div style={{
          width: 220,
          background: '#E6F1FB',
          border: '1px solid #185FA5',
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 12,
          marginTop: 40,
        }}>
          <div style={{ fontWeight: 700, color: '#0C447C', marginBottom: 10, fontSize: 13 }}>DLOM Reference Points</div>
          {[
            { label: 'IBBI registered floor', sublabel: '0% DLOM', price: dlomData[0]?.pricePerShare, color: '#888780' },
            { label: 'Negotiated entry', sublabel: '22% DLOM', price: entryPrice, color: '#185FA5' },
            { label: 'Ratchet price', sublabel: '30% DLOM', price: ratchetPrice, color: '#A32D2D' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ color: item.color, fontWeight: 600 }}>{item.label}</div>
              <div style={{ color: '#5f5e5a', fontSize: 11 }}>{item.sublabel}</div>
              <div style={{ fontWeight: 700, color: '#1a1a18', fontSize: 14, marginTop: 2 }}>
                ₹{item.price?.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#888780', marginTop: 4 }}>
            DLOM affects equity valuation only. Note conversion price is pegged to Series A.
          </div>
        </div>
      </div>
    </section>
  );
}
