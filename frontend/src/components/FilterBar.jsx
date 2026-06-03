import { CATEGORIES } from "../constants/categories";

export default function FilterBar({ filters, onChange, onClear }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="filters-panel">
      <div className="search-wrap">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="search"
          className="search-input"
          value={filters.search}
          onChange={set("search")}
          placeholder="Search transactions…"
          aria-label="Search transactions"
        />
      </div>

      <div className="filter-chips">
        <select
          className="filter-select"
          value={filters.category}
          onChange={set("category")}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="date"
          className="filter-date"
          value={filters.date_from}
          onChange={set("date_from")}
          aria-label="From date"
          title="From date"
        />
        <span className="filter-sep">→</span>
        <input
          type="date"
          className="filter-date"
          value={filters.date_to}
          onChange={set("date_to")}
          aria-label="To date"
          title="To date"
        />

        {activeCount > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear {activeCount > 1 ? `(${activeCount})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
