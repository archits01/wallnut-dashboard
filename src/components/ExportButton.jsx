import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportButton({ targetId = 'pdf-export-area' }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) { setLoading(false); return; }

      const canvas = await html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#f8f7f4',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min(pageW / imgW, pageH / imgH);

      const drawW = imgW * ratio;
      const drawH = imgH * ratio;
      const x = (pageW - drawW) / 2;
      const y = 0;

      pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Prepared by CoLeads EdgeWorks LLP · Confidential · Not for distribution', pageW / 2, pageH - 4, { align: 'center' });

      const date = new Date().toISOString().split('T')[0];
      pdf.save(`wallnut-deal-model-${date}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="export-btn"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: loading ? '#d1cfc8' : '#042C53',
        color: 'white',
        border: 'none', borderRadius: 8,
        padding: '8px 16px', fontSize: 13, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? (
        <>
          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          Exporting...
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export PDF
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
