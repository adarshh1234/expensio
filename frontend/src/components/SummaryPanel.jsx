import { useSummary } from "../hooks/useExpenses";
import SpendingRing from "./SpendingRing";
import { fmtCurrency } from "../constants/categories";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SummaryPanel({ year, month }) {
  const { summary, loading } = useSummary(year, month);
  const breakdown = summary?.breakdown || {};
  const topCategory = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];

  if (loading) {
    return (
      <div className="dashboard-grid dashboard-skeleton" aria-busy="true">
        <div className="skeleton hero-skeleton" />
        <div className="skeleton card-skeleton" />
        <div className="skeleton card-skeleton" />
        <div className="skeleton card-skeleton" />
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <article className="hero-card">
        <div className="hero-card-bg" aria-hidden />
        <div className="hero-content">
          <span className="hero-eyebrow">{MONTHS[month - 1]} {year}</span>
          <p className="hero-label">Total spending</p>
          <p className="hero-amount">{fmtCurrency(summary?.total || 0)}</p>
          <div className="hero-meta">
            <span>{summary?.count || 0} transactions</span>
            <span className="hero-dot" />
            <span>{fmtCurrency(summary?.daily_avg || 0)}/day avg</span>
          </div>
        </div>
        {topCategory && (
          <div className="hero-chip">
            <span className="hero-chip-label">Top category</span>
            <strong>{topCategory[0]}</strong>
            <span>{fmtCurrency(topCategory[1])}</span>
          </div>
        )}
      </article>

      <article className="stat-card">
        <div className="stat-icon stat-icon--avg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 5 5-9"/></svg>
        </div>
        <p className="stat-label">Daily average</p>
        <p className="stat-value">{fmtCurrency(summary?.daily_avg || 0)}</p>
        <p className="stat-hint">Based on days in month</p>
      </article>

      <article className="stat-card">
        <div className="stat-icon stat-icon--max">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 7l-5-5-5 5"/></svg>
        </div>
        <p className="stat-label">Largest expense</p>
        <p className="stat-value">
          {summary?.largest ? fmtCurrency(summary.largest.amount) : "—"}
        </p>
        <p className="stat-hint truncate">
          {summary?.largest?.title || "No expenses yet"}
        </p>
      </article>

      <article className="stat-card stat-card--chart">
        <p className="stat-label stat-label--chart">Spending mix</p>
        <SpendingRing breakdown={breakdown} total={summary?.total} />
      </article>
    </div>
  );
}
