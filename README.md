# Expensio — Personal Expense Tracker

Full-stack expense tracker built for the **Riafy Software Engineer Practical Test**.

| Layer | Choice |
|-------|--------|
| Backend | Django 4 + Django REST Framework |
| Frontend | React 19 + Vite |
| Database | SQLite (file: `backend/db.sqlite3`, created on first migrate) |

---

## Quick start (reviewers)

You need **two terminals**. Start the **backend first**, then the **frontend**.

### Prerequisites

- **Python 3.10+** (`python --version`)
- **Node.js 18+** (`node --version`)

### Terminal 1 — Backend

From the **repository root** (folder that contains `backend/` and `frontend/`):

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Leave this running. API base: **http://localhost:8000/api/**

Optional — run automated tests:

```bash
cd backend
python manage.py test expenses --verbosity=2
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL (usually **http://localhost:5173**; if that port is busy it may use **5174** — use whatever Vite shows).

Open that URL in your browser. The frontend proxies `/api` to Django — **both servers must be running**.

### Smoke test (2 minutes)

1. **Add** — Sidebar → title, amount, category (pill), date → **Add expense**
2. **List** — Row appears under **Today** (or the expense date)
3. **Edit** — Pencil icon → change title → **Save changes**
4. **Summary** — Overview shows month total + category breakdown (defaults to **current month**)
5. **Filter** — Search by title, filter category, set date range → **Clear**
6. **Delete** — Trash icon → confirm modal

---

## What I built and why

### Requirements mapping

| Spec | Implementation |
|------|----------------|
| Add expense (title, amount, category, date, optional note) | `ExpenseForm` + `POST /api/expenses/` |
| Categories: Food, Transport, Shopping, Bills, Entertainment, Other | Model `choices` + UI category pills |
| Date defaults to today | Form initial state uses today's date |
| List expenses, newest first | Model `ordering = ['-date', '-created_at']`; UI groups by date |
| Edit / delete | `PATCH` / `DELETE` + edit form + confirm modal |
| Monthly summary (total + by category) | `GET /api/expenses/summary/?year=&month=` + Overview dashboard |
| Filter by category, date range, title search | Query params on list endpoint + `FilterBar` |

### Architecture

**Client–server split** so the API can be tested independently (16 Django tests) and the UI stays a thin consumer.

- **Django REST Framework** — `ModelViewSet` for CRUD, `@action` for `/summary/`, serializers for validation. Familiar structure for reviewers (models / serializers / views / tests).
- **React + Vite** — Components map to features: form, list, filters, summary. `useExpenses` / `useSummary` hooks isolate fetch logic.
- **SQLite** — Zero config for a local single-user app; `db.sqlite3` is gitignored and created via `migrate`.

### Data model

```
Expense
  id           — AutoField (PK)
  title        — CharField(200), required, stripped
  amount       — DecimalField(12,2), > 0 (not Float — avoids money rounding bugs)
  date         — DateField, required
  category     — CharField with fixed choices (6 categories)
  note         — TextField, optional
  created_at   — auto
  updated_at   — auto
```

**Why `DecimalField`?** Floating point is unsafe for currency (e.g. `0.1 + 0.2`). Decimals store money exactly.

**Why timestamps?** Useful for ordering same-day expenses and future auditing; not shown in the main UI but returned by the API.

---

## Stack choices and tradeoffs

| Choice | Why | Tradeoff |
|--------|-----|----------|
| **Django + DRF** | Fast CRUD API, built-in admin, strong validation, test client | Heavier than a micro-framework for this small scope |
| **React** | Component reuse, clear state for form vs list | Needs Node toolchain; overkill for static HTML but scales if features grow |
| **Vite** | Fast dev server, simple proxy to Django | Production build not required by spec; dev mode is enough |
| **SQLite** | No DB server setup | Not for multi-user production; fine for local practical test |
| **No auth** | Spec: personal local app | Anyone with API access can read/write — acceptable per brief |
| **CORS open in dev** | Frontend may run on port 5173/5174 | `CORS_ALLOW_ALL_ORIGINS = True` in settings — dev only |
| **Pagination (100)** | DRF default | Lists cap at 100 items; documented under rough edges |

---

## Completed vs skipped

### Completed

- Full CRUD for expenses
- All six categories
- Monthly summary: total, count, daily average, largest expense, category breakdown
- Filters: `search`, `category`, `date_from`, `date_to`
- Frontend validation + backend serializer validation
- Empty states, loading states, delete confirmation
- **16 backend tests** (`python manage.py test expenses`)

### Intentionally skipped (per spec / time)

| Item | Reason |
|------|--------|
| Authentication / multi-user | Not required; local personal tracker |
| Deployment | Spec says run locally only |
| Multi-currency | Spec: single local currency (₹ in UI) |
| CSV/PDF export | Out of scope |
| Frontend test suite | Spec says they don't care about tests; backend tests cover API |
| Pixel-perfect design | Spec says not evaluated; UI is functional + readable |

---

## Known rough edges

1. **Two processes required** — App will show errors if only frontend or only backend is running.
2. **Vite port** — Default `5173`; if occupied, Vite picks another port (e.g. `5174`). Use the URL printed in the terminal.
3. **List vs summary month** — Overview/summary use the month selected in the sidebar (defaults to current month). The transaction list shows **all** expenses unless filters are applied (not limited to that month).
4. **Pagination** — API returns at most **100** expenses per page (`PAGE_SIZE` in `settings.py`). No UI pagination yet.
5. **Daily average** — `month_total / days_in_month`, not “average only on days you spent”.
6. **Chart percentages** — Category legend uses rounded whole percents (e.g. 63% + 38% can sum to 101%); rupee totals are exact.
7. **`SECRET_KEY`** — Dev placeholder in `settings.py`; not for production.
8. **Database file** — `backend/db.sqlite3` is created locally and not committed (gitignored).

---

## Edge cases handled

### Backend

| Case | Behavior |
|------|----------|
| Blank title | 400 — validation error |
| Amount ≤ 0 or negative | 400 — validation error |
| Amount > 99,999,999.99 | 400 — validation error |
| Date before 2000 / after 2100 | 400 — validation error |
| Invalid category | 400 — choice validation |
| `date_from` > `date_to` | 200 with **empty list** (not an error) |
| Invalid `year` / `month` on summary | 400 with message |
| Malformed date query params | Ignored (filter not applied) |

### Frontend

| Case | Behavior |
|------|----------|
| Invalid form (empty title, no category, bad amount) | Inline error before API call |
| API errors on save | Shown in form |
| Empty list | “No transactions yet” empty state |
| Delete | Confirmation modal |
| Failed load | Error message on list |

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/` | List (newest first) + filters |
| POST | `/api/expenses/` | Create |
| GET | `/api/expenses/:id/` | Retrieve |
| PATCH | `/api/expenses/:id/` | Update |
| DELETE | `/api/expenses/:id/` | Delete |
| GET | `/api/expenses/summary/` | Monthly summary |

**List filters:** `search`, `category`, `date_from`, `date_to` (YYYY-MM-DD)

**Summary:** `year`, `month` (1–12); defaults to current month

---

## Project structure

```
.
├── README.md                 ← you are here
├── .gitignore
├── backend/
│   ├── config/               # Django settings, root URLs
│   ├── expenses/             # App: model, serializer, views, tests
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/expenses.js
    │   ├── components/       # ExpenseForm, ExpenseList, FilterBar, SummaryPanel, SpendingRing
    │   ├── constants/categories.js
    │   ├── hooks/useExpenses.js
    │   ├── App.jsx
    │   └── styles.css
    ├── index.html
    ├── package.json
    └── vite.config.js        # proxies /api → http://localhost:8000
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Failed to load expenses` | Start backend: `python manage.py runserver` in `backend/` |
| Network error / 404 on `/api` | Backend must be on port **8000**; check `vite.config.js` proxy |
| `pip` not found | Use `python -m pip install -r requirements.txt` |
| Migrate errors | Delete `backend/db.sqlite3` and run `python manage.py migrate` again |
| Port 8000 in use | `python manage.py runserver 8001` and update `vite.config.js` proxy target |

---

## License

Submitted as a practical test assignment.
