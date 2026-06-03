import { useState, useCallback, useMemo } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import FilterBar from "./components/FilterBar";
import SummaryPanel from "./components/SummaryPanel";
import { useExpenses } from "./hooks/useExpenses";
import "./styles.css";

const EMPTY_FILTERS = { search: "", category: "", date_from: "", date_to: "" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function App() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showForm, setShowForm] = useState(true);

  const activeFilters = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")),
    [filters]
  );

  const { expenses, loading, error, reload } = useExpenses(activeFilters);

  const handleSaved = useCallback(() => {
    setEditing(null);
    reload();
  }, [reload]);

  const handleEdit = useCallback((e) => {
    setEditing(e);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const shiftMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setViewYear(y);
    setViewMonth(m);
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden>E</div>
          <div>
            <span className="brand-name">Expensio</span>
            <span className="brand-tag">Expense tracker</span>
          </div>
        </div>

        <div className="sidebar-month">
          <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="sidebar-month-label">{MONTHS[viewMonth - 1]} {viewYear}</span>
          <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <button
          type="button"
          className="sidebar-toggle-form"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Hide form" : "+ Add expense"}
        </button>

        {showForm && (
          <ExpenseForm
            editing={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        )}

        <div className="sidebar-footer">
          <p>Track every rupee. Stay in control.</p>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Overview</h1>
            <p className="page-subtitle">
              {MONTHS[viewMonth - 1]} {viewYear} · Your spending at a glance
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-compact topbar-add"
            onClick={() => { setShowForm(true); setEditing(null); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New expense
          </button>
        </header>

        <main className="dashboard">
          <SummaryPanel year={viewYear} month={viewMonth} />

          <section className="transactions-section">
            <div className="section-head">
              <div>
                <h2 className="section-title">Transactions</h2>
                <p className="section-desc">
                  {hasFilters ? "Filtered results" : "All recorded expenses"}
                </p>
              </div>
              {!loading && (
                <span className="count-badge">
                  {expenses.length} {expenses.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>

            <FilterBar
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />

            <ExpenseList
              expenses={expenses}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDeleted={reload}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
