const MILESTONES = [
  { month: 0,  label: 'Signing',                  detail: 'Day 0',         above: true  },
  { month: 2,  label: 'Governance onboarding',     detail: 'Month 1–3',     above: false },
  { month: 9,  label: 'FY27 midpoint review',      detail: 'Month 6–12',    above: true  },
  { month: 12, label: 'FY27 ratchet determination',detail: 'Month 12',      above: false },
  { month: 21, label: 'FY28 results + Series A',   detail: 'Month 18–24',   above: true  },
  { month: 33, label: 'SME IPO filing',            detail: 'Month 30–36',   above: false },
  { month: 60, label: 'Put option activates',      detail: 'Month 60 (if no IPO)', above: true },
];

const MAX_MONTH = 60;
const LEFT_PAD  = 4;   // % from left edge
const RIGHT_PAD = 4;   // % from right edge
const TRACK_RANGE = 100 - LEFT_PAD - RIGHT_PAD;

function pct(month) {
  return LEFT_PAD + (month / MAX_MONTH) * TRACK_RANGE;
}

const ABOVE_TOP   = 0;    // px from top of container — label base
const LINE_TOP    = 64;   // px — centre of the track line
const BELOW_TOP   = 82;   // px — label base for below-line labels
const DOT_SIZE    = 12;
const CONTAINER_H = 180;  // total height of the relative div

export default function DealTimeline({ exitMonths }) {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', marginBottom: 6 }}>
        Deal Timeline
      </h2>
      <p style={{ fontSize: 12, color: '#5f5e5a', marginBottom: 24 }}>
        Key milestones and decision points over the investment horizon
      </p>

      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ position: 'relative', minWidth: 680, height: CONTAINER_H }}>

          {/* Track line */}
          <div style={{
            position: 'absolute',
            top: LINE_TOP - 1,
            left: `${LEFT_PAD}%`,
            right: `${RIGHT_PAD}%`,
            height: 3,
            background: 'linear-gradient(to right, #185FA5, #534AB7)',
            borderRadius: 2,
          }} />

          {/* Current-position indicator */}
          <div style={{
            position: 'absolute',
            top: LINE_TOP - 11,
            left: `${pct(exitMonths)}%`,
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}>
            {/* Tooltip above */}
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#042C53',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              marginBottom: 4,
            }}>
              Exit: {exitMonths}mo
            </div>
            <div style={{
              width: 22,
              height: 22,
              background: '#042C53',
              border: '3px solid white',
              borderRadius: '50%',
              boxShadow: '0 0 0 3px rgba(4,44,83,0.25)',
            }} />
          </div>

          {/* Milestones */}
          {MILESTONES.map((m, i) => {
            const left  = `${pct(m.month)}%`;
            const isPast    = m.month <= exitMonths;
            const isCurrent = Math.abs(m.month - exitMonths) < 4;
            const dotColor  = isCurrent ? '#BA7517' : isPast ? '#185FA5' : '#d1cfc8';
            const dotBorder = isCurrent ? '#633806'  : isPast ? '#0C447C'  : '#888780';
            const txtColor  = isCurrent ? '#633806'  : isPast ? '#185FA5'  : '#888780';

            return (
              <div key={i}>
                {/* Dot */}
                <div style={{
                  position: 'absolute',
                  top: LINE_TOP - DOT_SIZE / 2,
                  left,
                  transform: 'translateX(-50%)',
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  background: dotColor,
                  border: `2px solid ${dotBorder}`,
                  borderRadius: '50%',
                  zIndex: 10,
                  transition: 'background 0.3s',
                }} />

                {/* Connector line */}
                <div style={{
                  position: 'absolute',
                  left,
                  top: m.above ? LINE_TOP - DOT_SIZE / 2 - 28 : LINE_TOP + DOT_SIZE / 2,
                  width: 1,
                  height: 28,
                  background: dotBorder,
                  opacity: 0.3,
                  transform: 'translateX(-50%)',
                }} />

                {/* Label */}
                {m.above ? (
                  <div style={{
                    position: 'absolute',
                    bottom: CONTAINER_H - (LINE_TOP - DOT_SIZE / 2 - 30),
                    left,
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    width: 96,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: txtColor, lineHeight: 1.35 }}>{m.label}</div>
                    <div style={{ fontSize: 9, color: '#888780', marginTop: 1 }}>{m.detail}</div>
                  </div>
                ) : (
                  <div style={{
                    position: 'absolute',
                    top: LINE_TOP + DOT_SIZE / 2 + 30,
                    left,
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    width: 96,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: txtColor, lineHeight: 1.35 }}>{m.label}</div>
                    <div style={{ fontSize: 9, color: '#888780', marginTop: 1 }}>{m.detail}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
