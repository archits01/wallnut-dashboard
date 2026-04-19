import { useState, useMemo } from 'react';
import {
  DEFAULT_PARAMS, calcDeal, calcAllScenarios, dlomSensitivity, capTableWaterfall, fmt
} from './lib/dealModel';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import ScenarioMatrix from './components/ScenarioMatrix';
import ReturnWaterfall from './components/ReturnWaterfall';
import CapTableChart from './components/CapTableChart';
import IrrComparison from './components/IrrComparison';
import DlomSensitivity from './components/DlomSensitivity';
import DealTimeline from './components/DealTimeline';
import ExportButton from './components/ExportButton';

const EXTENDED_DEFAULTS = {
  ...DEFAULT_PARAMS,
  ebitdaCr: 14,
  waccPct: 24,
};

export default function App() {
  const [params, setParams] = useState(EXTENDED_DEFAULTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const result    = useMemo(() => calcDeal(params), [params]);
  const scenarios = useMemo(() => calcAllScenarios(params), [params]);
  const dlomData  = useMemo(() => dlomSensitivity(params.ebitdaCr || 14, params.waccPct || 24, params.tgrPct, params.preMoneyShares), [params]);
  const capTable  = useMemo(() => capTableWaterfall(params), [params]);

  const handleParam  = key => e => setParams(prev => ({ ...prev, [key]: +e.target.value }));
  const handleToggle = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f7f4' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper${sidebarOpen ? ' open' : ''}`}>
        <Sidebar
          params={params}
          onParam={handleParam}
          onToggle={handleToggle}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hamburger"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, borderRadius: 6, display: 'none',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a18" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.2px' }}>
                Wallnut Building Solutions India
              </div>
              <div style={{ fontSize: 11, color: '#5f5e5a', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>CoLeads EdgeWorks · Deal Model</span>
                <span style={{
                  background: params.ratchetTriggered ? '#FCEBEB' : '#EAF3DE',
                  color: params.ratchetTriggered ? '#A32D2D' : '#0F6E56',
                  padding: '1px 6px', borderRadius: 4, fontWeight: 600, fontSize: 10,
                }}>
                  {params.ratchetTriggered ? 'Ratchet Active' : 'Base scenario'}
                </span>
                {params.supplierDeal && (
                  <span style={{
                    background: '#E6F1FB', color: '#185FA5',
                    padding: '1px 6px', borderRadius: 4, fontWeight: 600, fontSize: 10,
                  }}>
                    Supplier deal
                  </span>
                )}
              </div>
            </div>
          </div>
          <ExportButton targetId="pdf-export-area" />
        </div>

        {/* Dashboard */}
        <div style={{ padding: '24px' }} id="pdf-export-area">

          {/* Summary metric cards */}
          <div className="metrics-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}>
            <MetricCard
              label="Total capital deployed"
              value={fmt.cr(result.totalCapitalCr)}
              sub={`₹${params.eqAmtCr} Cr equity + ₹${params.noteAmtCr} Cr note`}
              accent="blue"
            />
            <MetricCard
              label="Equity stake"
              value={fmt.pct(result.eqStakePct)}
              sub={`${fmt.num(result.totalInvestorShares)} shares @ ${fmt.rs(result.actualEqPrice)}`}
              accent="blue"
              ratchetActive={params.ratchetTriggered}
            />
            <MetricCard
              label="Total post-A stake"
              value={fmt.pct(result.totalStakePct)}
              sub={`${fmt.num(result.totalInvestorShares + result.noteShares)} total shares`}
              accent="purple"
            />
            <MetricCard
              label="Note converts at"
              value={fmt.rs(result.convPricePerShare)}
              sub={`${fmt.pct(result.convDiscPct)} discount to Series A`}
              accent="amber"
            />
            <MetricCard
              label="Annual interest"
              value={fmt.cr(result.annualInterestCr)}
              sub={`${fmt.pct(params.couponPct)} p.a. · Total: ${fmt.cr(result.totalInterestCr)}`}
              accent="green"
            />
            <MetricCard
              label="IRR"
              value={fmt.pct(result.irrPct)}
              sub={`Over ${params.exitMonths} months`}
              accent="purple"
            />
            <MetricCard
              label="MOIC"
              value={fmt.moic(result.moic)}
              sub={`${fmt.cr(result.totalReturnCr)} total return`}
              accent="purple"
            />
            <MetricCard
              label="Seller dilution"
              value={fmt.pct(result.sellerDilutionPct)}
              sub="Combined equity + note stake"
              accent="red"
            />
          </div>

          {/* Return waterfall */}
          <div style={{
            background: 'white', borderRadius: 12, padding: 20,
            border: '1px solid rgba(0,0,0,0.08)', marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <ReturnWaterfall result={result} />
          </div>

          {/* IRR + Cap Table */}
          <div className="charts-row" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20,
          }}>
            <div style={{
              background: 'white', borderRadius: 12, padding: 20,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <IrrComparison scenarios={scenarios} params={params} />
            </div>
            <div style={{
              background: 'white', borderRadius: 12, padding: 20,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <CapTableChart capTable={capTable} />
            </div>
          </div>

          {/* DLOM sensitivity */}
          <div style={{
            background: 'white', borderRadius: 12, padding: 20,
            border: '1px solid rgba(0,0,0,0.08)', marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <DlomSensitivity dlomData={dlomData} params={params} />
          </div>

          {/* Scenario matrix */}
          <div style={{
            background: 'white', borderRadius: 12, padding: 20,
            border: '1px solid rgba(0,0,0,0.08)', marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <ScenarioMatrix scenarios={scenarios} params={params} />
          </div>

          {/* Deal timeline */}
          <div style={{
            background: 'white', borderRadius: 12, padding: 20,
            border: '1px solid rgba(0,0,0,0.08)', marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <DealTimeline exitMonths={params.exitMonths} />
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center', fontSize: 11, color: '#888780',
            padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.08)',
          }}>
            Prepared by CoLeads EdgeWorks LLP · Confidential · Not for distribution
          </div>
        </div>
      </main>

      <style>{`
        .sidebar-wrapper {
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .hamburger { display: flex !important; }
          .sidebar-wrapper {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            z-index: 40;
            box-shadow: 2px 0 12px rgba(0,0,0,0.15);
          }
          .sidebar-wrapper.open { transform: translateX(0); }
          .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .charts-row { grid-template-columns: 1fr !important; }
          .scenario-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .scenario-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
