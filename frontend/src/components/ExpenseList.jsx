import { useState, useMemo } from "react";
import { deleteExpense } from "../api/expenses";
import { CAT_META, fmtCurrency, fmtDateGroup } from "../constants/categories";

function groupByDate(expenses) {
  const groups = new Map();
  for (const e of expenses) {
    const key = e.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default function ExpenseList({ expenses, loading, error, onEdit, onDeleted }) {
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const grouped = useMemo(() => groupByDate(expenses), [expenses]);
  const confirmExpense = expenses.find((e) => e.id === confirmId);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(confirmId);
      setConfirmId(null);
      onDeleted();
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="list-skeleton">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton row-skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <span className="state-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="state-card state-empty">
        <div className="empty-illustration" aria-hidden>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="14" width="48" height="38" rx="8" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <path d="M20 28h24M20 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          </svg>
        </div>
        <h3>No transactions yet</h3>
        <p>Add your first expense using the form on the left or the New expense button.</p>
      </div>
    );
  }

  return (
    <>
      <div className="tx-groups">
        {grouped.map(([date, items]) => (
          <section key={date} className="tx-group">
            <header className="tx-group-head">
              <span className="tx-group-date">{fmtDateGroup(date)}</span>
              <span className="tx-group-total">
                {fmtCurrency(items.reduce((s, e) => s + Number(e.amount), 0))}
              </span>
            </header>
            <ul className="tx-list">
              {items.map((e) => {
                const meta = CAT_META[e.category] || CAT_META.Other;
                return (
                  <li className="tx-row" key={e.id}>
                    <div
                      className="tx-icon"
                      style={{ background: meta.bg, color: meta.color }}
                      aria-hidden
                    >
                      {meta.emoji}
                    </div>
                    <div className="tx-body">
                      <div className="tx-title-line">
                        <span className="tx-title">{e.title}</span>
                        <span className="tx-cat" style={{ color: meta.color }}>{e.category}</span>
                      </div>
                      {e.note && <p className="tx-note">{e.note}</p>}
                    </div>
                    <div className="tx-right">
                      <span className="tx-amount">{fmtCurrency(e.amount)}</span>
                      <div className="tx-actions">
                        <button
                          type="button"
                          className="icon-btn icon-btn--soft"
                          onClick={() => onEdit(e)}
                          aria-label={`Edit ${e.title}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setConfirmId(e.id)}
                          aria-label={`Delete ${e.title}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)} role="presentation">
          <div
            className="modal"
            onClick={(ev) => ev.stopPropagation()}
            role="dialog"
            aria-labelledby="delete-title"
          >
            <div className="modal-icon modal-icon--danger" aria-hidden>🗑️</div>
            <h3 id="delete-title" className="modal-title">Delete expense?</h3>
            <p className="modal-body">
              <strong>{confirmExpense?.title}</strong> ({fmtCurrency(confirmExpense?.amount)}) will be permanently removed.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger-solid"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
