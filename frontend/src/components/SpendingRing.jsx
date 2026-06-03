import { CAT_META, fmtCurrency } from "../constants/categories";

const R = 52;
const C = 2 * Math.PI * R;

export default function SpendingRing({ breakdown, total }) {
  const entries = Object.entries(breakdown || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    return (
      <div className="spending-ring spending-ring--empty">
        <div className="ring-center">
          <span className="ring-label">No spending yet</span>
          <span className="ring-total">{fmtCurrency(0)}</span>
        </div>
      </div>
    );
  }

  const sum = entries.reduce((s, [, v]) => s + v, 0);
  let offset = 0;

  const segments = entries.map(([cat, amt]) => {
    const pct = amt / sum;
    const dash = pct * C;
    const seg = {
      cat,
      amt,
      pct,
      color: CAT_META[cat]?.color || "#94a3b8",
      dash,
      offset,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="spending-ring">
      <svg viewBox="0 0 120 120" className="ring-svg" aria-hidden>
        <circle cx="60" cy="60" r={R} className="ring-track" />
        {segments.map((s) => (
          <circle
            key={s.cat}
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            strokeDashoffset={-s.offset + C * 0.25}
            className="ring-segment"
          />
        ))}
      </svg>
      <div className="ring-center">
        <span className="ring-label">Total spent</span>
        <span className="ring-total">{fmtCurrency(total || sum)}</span>
      </div>
      <ul className="ring-legend">
        {segments.slice(0, 5).map((s) => (
          <li key={s.cat}>
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="legend-name">{s.cat}</span>
            <span className="legend-pct">{Math.round(s.pct * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
