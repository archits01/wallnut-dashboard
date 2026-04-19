export default function MetricCard({ label, value, sub, accent = 'blue', ratchetActive = false }) {
  const accents = {
    blue:   { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C', val: '#185FA5' },
    purple: { bg: '#EEEDFE', border: '#534AB7', text: '#3C3489', val: '#534AB7' },
    amber:  { bg: '#FAEEDA', border: '#BA7517', text: '#633806', val: '#BA7517' },
    green:  { bg: '#EAF3DE', border: '#0F6E56', text: '#27500A', val: '#0F6E56' },
    red:    { bg: '#FCEBEB', border: '#A32D2D', text: '#791F1F', val: '#A32D2D' },
  };
  const c = accents[accent] || accents.blue;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      position: 'relative',
      minHeight: 90,
    }}>
      {ratchetActive && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: '#A32D2D', color: 'white',
          fontSize: 10, fontWeight: 600, padding: '2px 6px',
          borderRadius: 4, letterSpacing: '0.3px',
        }}>ratchet active</span>
      )}
      <div style={{ fontSize: 11, color: c.text, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: c.val, lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: c.text, marginTop: 3, opacity: 0.8 }}>{sub}</div>
      )}
    </div>
  );
}
