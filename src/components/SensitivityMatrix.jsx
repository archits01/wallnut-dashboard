import { MATRIX_TGR, MATRIX_WACC } from '../lib/dcfModel';

function lerp(a, b, t) { return a + (b - a) * t; }

function cellStyle(vps, min, max, isHighlighted) {
  if (!isFinite(vps) || vps <= 0) {
    return { background: '#F8F7F4', color: '#b0aea8', fontWeight: 400 };
  }
  const t = Math.min(1, Math.max(0, (vps - min) / (max - min)));

  // White (#fff) → Navy (#042C53)
  const r = Math.round(lerp(248, 4,  t));
  const g = Math.round(lerp(247, 44, t));
  const b = Math.round(lerp(244, 83, t));

  return {
    background: isHighlighted ? '#185FA5' : `rgb(${r},${g},${b})`,
    color: isHighlighted ? 'white' : t > 0.55 ? 'white' : '#1a1a18',
    fontWeight: isHighlighted ? 700 : t > 0.4 ? 600 : 400,
    outline: isHighlighted ? '2px solid #042C53' : 'none',
    outlineOffset: '-2px',
  };
}

export default function SensitivityMatrix({ matrix, params }) {
  // Find closest row/col to current params
  const closestTgr  = MATRIX_TGR.reduce((c, v)  => Math.abs(v - params.tgrPct)  < Math.abs(c - params.tgrPct)  ? v : c, MATRIX_TGR[0]);
  const closestWacc = MATRIX_WACC.reduce((c, v) => Math.abs(v - params.waccPct) < Math.abs(c - params.waccPct) ? v : c, MATRIX_WACC[0]);

  const allVps = matrix.flat().filter(v => isFinite(v) && v > 0);
  const minVps = Math.min(...allVps);
  const maxVps = Math.max(...allVps);

  const isCurrentTgr  = (tgr)  => tgr  === closestTgr;
  const isCurrentWacc = (wacc) => wacc === closestWacc;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>
            Sensitivity Matrix  ·  Value Per Share (₹)
          </h2>
          <p style={{ fontSize: 12, color: '#888780' }}>
            TGR (rows) × WACC (columns)  ·  DLOM fixed at {params.dlomPct}%  ·  highlighted cell = nearest to current selection
          </p>
        </div>
        {/* Color scale legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ color: '#888780' }}>Lower</span>
          <div style={{
            width: 80, height: 10, borderRadius: 4,
            background: 'linear-gradient(to right, #F8F7F4, #042C53)',
          }} />
          <span style={{ color: '#888780' }}>Higher VPS</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 10 }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3, fontSize: 12, minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{
                padding: '8px 14px', textAlign: 'center', fontSize: 10,
                color: '#888780', fontWeight: 600, background: 'transparent',
              }}>
                TGR \ WACC
              </th>
              {MATRIX_WACC.map(wacc => (
                <th key={wacc} style={{
                  padding: '8px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: isCurrentWacc(wacc) ? '#185FA5' : '#5f5e5a',
                  background: isCurrentWacc(wacc) ? '#E6F1FB' : '#F8F7F4',
                  borderRadius: 6,
                  minWidth: 72,
                }}>
                  {wacc.toFixed(1)}%
                  {isCurrentWacc(wacc) && (
                    <div style={{ fontSize: 9, color: '#185FA5', fontWeight: 600 }}>◄ now</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_TGR.map((tgr, ri) => (
              <tr key={tgr}>
                <td style={{
                  padding: '8px 14px', fontWeight: 700, fontSize: 11, textAlign: 'center',
                  color: isCurrentTgr(tgr) ? '#185FA5' : '#5f5e5a',
                  background: isCurrentTgr(tgr) ? '#E6F1FB' : '#F8F7F4',
                  borderRadius: 6, whiteSpace: 'nowrap',
                }}>
                  {tgr.toFixed(1)}%
                  {isCurrentTgr(tgr) && <span style={{ marginLeft: 4, fontSize: 9 }}>▲</span>}
                </td>
                {MATRIX_WACC.map((wacc, ci) => {
                  const vps = matrix[ri][ci];
                  const hl  = isCurrentTgr(tgr) && isCurrentWacc(wacc);
                  const cs  = cellStyle(vps, minVps, maxVps, hl);
                  return (
                    <td key={wacc} style={{
                      padding: '9px 10px', textAlign: 'center',
                      borderRadius: 6,
                      fontVariantNumeric: 'tabular-nums',
                      transition: 'background 0.2s',
                      cursor: 'default',
                      ...cs,
                    }}>
                      {vps > 0
                        ? '₹' + Math.round(vps).toLocaleString('en-IN')
                        : <span style={{ color: '#b0aea8' }}>—</span>
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11, color: '#b0aea8', marginTop: 10 }}>
        Values shown assume DLOM = {params.dlomPct}%, LT Debt = ₹{(4207.94).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L, Cash = ₹{(1643.25).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L.
        Adjust DLOM slider to reprice all cells.
      </div>
    </section>
  );
}
