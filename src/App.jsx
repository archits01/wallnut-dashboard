import { useState, useMemo } from 'react';
import {
  DEFAULT_PARAMS, calcDCF, buildMatrix, buildSensLines, fmt,
} from './lib/dcfModel';
import DCFSidebar    from './components/DCFSidebar';
import MetricCard    from './components/MetricCard';
import FCFFTable     from './components/FCFFTable';
import ValueWaterfall from './components/ValueWaterfall';
import SensitivityChart  from './components/SensitivityChart';
import SensitivityMatrix from './components/SensitivityMatrix';
import ExportButton  from './components/ExportButton';

export default function App() {
  const [params, setParams]       = useState(DEFAULT_PARAMS);
  const [sidebarOpen, setSidebar] = useState(false);

  const onParam = key => e => setParams(prev => ({ ...prev, [key]: +e.target.value }));

  const result   = useMemo(() => calcDCF(params), [params]);
  const matrix   = useMemo(() => buildMatrix(params.dlomPct), [params.dlomPct]);
  const sensLines = useMemo(() => buildSensLines(params.waccPct, params.dlomPct), [params.waccPct, params.dlomPct]);

  const vpsValid = result.vps > 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F7F4' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebar(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30 }}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper${sidebarOpen ? ' open' : ''}`}>
        <DCFSidebar params={params} onParam={onParam} />
      </div>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>

        {/* Topbar */}
        <div style={{
          background: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '10px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger */}
            <button
              onClick={() => setSidebar(v => !v)}
              className="hamburger"
              style={{
                display: 'none', background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, borderRadius: 6,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a18" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.2px' }}>
                Wallnut Building Solutions India Pvt. Ltd.
              </div>
              <div style={{ fontSize: 11, color: '#888780' }}>
                Discounted Cash Flow Analysis  ·  TGR {params.tgrPct.toFixed(1)}%  ·  WACC {params.waccPct.toFixed(1)}%  ·  DLOM {params.dlomPct}%
              </div>
            </div>
          </div>
          <ExportButton targetId="pdf-area" />
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }} id="pdf-area">

          {/* Metric cards */}
          <div className="metrics-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24,
          }}>
            <MetricCard
              label="Terminal Value (PV)"
              value={fmt.L(result.tvPV, 2)}
              sub={`TGR ${params.tgrPct.toFixed(1)}%  ·  WACC ${params.waccPct.toFixed(1)}%`}
              accent="blue"
            />
            <MetricCard
              label="Enterprise Value"
              value={fmt.L(result.ev, 2)}
              sub={`Explicit PV + Terminal Value PV`}
              accent="blue"
            />
            <MetricCard
              label="Net Equity Value"
              value={fmt.L(result.netEquity, 2)}
              sub={`Post DLOM ${params.dlomPct}%, debt & cash`}
              accent="purple"
            />
            <MetricCard
              label="Value Per Share"
              value={vpsValid ? fmt.rs(result.vps, 2) : '—'}
              sub={`${(result.netEquity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L ÷ 10 L shares`}
              accent={vpsValid ? 'blue' : 'red'}
            />
          </div>

          {/* FCFF Table + Value Waterfall */}
          <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, marginBottom: 20 }}>
            <div style={card}>
              <FCFFTable result={result} params={params} />
            </div>
            <div style={card}>
              <ValueWaterfall result={result} params={params} />
            </div>
          </div>

          {/* Sensitivity chart */}
          <div style={{ ...card, marginBottom: 20 }}>
            <SensitivityChart sensLines={sensLines} params={params} />
          </div>

          {/* Sensitivity matrix */}
          <div style={{ ...card, marginBottom: 20 }}>
            <SensitivityMatrix matrix={matrix} params={params} />
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center', fontSize: 11, color: '#b0aea8',
            padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.07)',
          }}>
            Wallnut Building Solutions India Pvt. Ltd.  ·  DCF Analysis  ·  CoLeads EdgeWorks LLP  ·  For discussion purposes only
          </div>
        </div>
      </main>

      <style>{`
        .sidebar-wrapper { flex-shrink: 0; }
        @media (max-width: 768px) {
          .hamburger { display: flex !important; }
          .sidebar-wrapper {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            z-index: 40;
            box-shadow: 2px 0 16px rgba(0,0,0,0.15);
          }
          .sidebar-wrapper.open { transform: translateX(0); }
          .metrics-grid { grid-template-columns: repeat(2,1fr) !important; }
          .charts-row   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const card = {
  background: 'white',
  borderRadius: 12,
  padding: 22,
  border: '1px solid rgba(0,0,0,0.07)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
