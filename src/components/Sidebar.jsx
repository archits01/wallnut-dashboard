import { useState } from 'react';

function SliderRow({ label, value, min, max, step, onChange, format, annotation }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label style={{ fontSize: 12, color: '#5f5e5a', fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a18' }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      {annotation && (
        <div style={{ fontSize: 10, color: '#888780', marginTop: 2 }}>{annotation}</div>
      )}
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#888780', letterSpacing: '0.8px',
      textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.1)',
      paddingBottom: 6, marginBottom: 12, marginTop: 20,
    }}>{children}</div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: '#5f5e5a', fontWeight: 500 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: value ? '#185FA5' : '#d1cfc8',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

export default function Sidebar({ params, onParam, onToggle, isOpen, onClose }) {
  const fmtCr = v => `₹${v} Cr`;
  const fmtRs = v => `₹${Math.round(v).toLocaleString('en-IN')}`;
  const fmtPct = v => `${v}%`;
  const fmtNum = v => Math.round(v).toLocaleString('en-IN');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40,
          }}
          className="mobile-overlay"
        />
      )}

      <aside className="sidebar" style={{
        width: 280, flexShrink: 0,
        background: 'white',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        overflowY: 'auto',
        padding: '0 0 24px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Brand header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          background: '#042C53',
          color: 'white',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>
            CoLeads EdgeWorks
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
            Wallnut Deal Model
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Interactive scenario explorer</div>
        </div>

        <div style={{ padding: '4px 20px 20px' }}>

          <SectionHeader>Pillar 01 — Equity</SectionHeader>

          <SliderRow label="Equity amount" value={params.eqAmtCr} min={10} max={35} step={1}
            onChange={onParam('eqAmtCr')} format={fmtCr} />
          <SliderRow label="Entry price / share" value={params.eqPricePerShare} min={856} max={2500} step={1}
            onChange={onParam('eqPricePerShare')} format={fmtRs}
            annotation={params.eqPricePerShare === 856 ? '⚑ IBBI registered floor' : 'IBBI floor: ₹856/share'} />
          <SliderRow label="Ratchet price / share" value={params.ratchetPrice} min={856} max={2000} step={1}
            onChange={onParam('ratchetPrice')} format={fmtRs} />
          <SliderRow label="Pre-money shares" value={params.preMoneyShares} min={800000} max={1500000} step={1000}
            onChange={onParam('preMoneyShares')} format={fmtNum} />

          <SectionHeader>Pillar 02 — Convertible Note</SectionHeader>

          <SliderRow label="Note amount" value={params.noteAmtCr} min={5} max={40} step={1}
            onChange={onParam('noteAmtCr')} format={fmtCr} />
          <SliderRow label="Coupon rate" value={params.couponPct} min={6} max={15} step={0.5}
            onChange={onParam('couponPct')} format={fmtPct} />
          <SliderRow label="Base conv. discount" value={params.baseDiscPct} min={5} max={20} step={1}
            onChange={onParam('baseDiscPct')} format={fmtPct} />
          <SliderRow label="Supplier deal discount" value={params.supplierDiscPct} min={10} max={30} step={1}
            onChange={onParam('supplierDiscPct')} format={fmtPct} />
          <SliderRow label="Series A price / share" value={params.seriesAPricePerShare} min={1500} max={5000} step={50}
            onChange={onParam('seriesAPricePerShare')} format={fmtRs} />

          <SectionHeader>Exit Assumptions</SectionHeader>

          <SliderRow label="IPO valuation" value={params.ipoValCr} min={100} max={600} step={10}
            onChange={onParam('ipoValCr')} format={fmtCr} />
          <SliderRow label="Exit horizon" value={params.exitMonths} min={24} max={60} step={6}
            onChange={onParam('exitMonths')} format={v => `${v} months`} />
          <Toggle label="Supplier deal achieved?" value={params.supplierDeal} onChange={v => onToggle('supplierDeal', v)} />
          <Toggle label="Ratchet triggered?" value={params.ratchetTriggered} onChange={v => onToggle('ratchetTriggered', v)} />

          <SectionHeader>DCF Inputs (DLOM chart)</SectionHeader>

          <SliderRow label="Normalised EBITDA" value={params.ebitdaCr || 14} min={5} max={30} step={0.5}
            onChange={onParam('ebitdaCr')} format={fmtCr} />
          <SliderRow label="WACC" value={params.waccPct || 24} min={15} max={35} step={1}
            onChange={onParam('waccPct')} format={fmtPct} />
          <SliderRow label="Terminal growth rate" value={params.tgrPct} min={3} max={8} step={0.5}
            onChange={onParam('tgrPct')} format={fmtPct} />

        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          fontSize: 10, color: '#888780', textAlign: 'center',
        }}>
          Confidential · Not for distribution
        </div>
      </aside>
    </>
  );
}
