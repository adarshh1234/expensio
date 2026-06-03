import { useState, useEffect } from "react";
import { createExpense, updateExpense } from "../api/expenses";
import { CATEGORIES, CAT_META } from "../constants/categories";

const EMPTY = {
  title: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  note: "",
};

function validate(f) {
  if (!f.title.trim()) return "Title is required.";
  if (!f.amount || isNaN(Number(f.amount)) || Number(f.amount) <= 0)
    return "Amount must be a positive number.";
  if (Number(f.amount) > 99999999) return "Amount is unrealistically large.";
  if (!f.date) return "Date is required.";
  const d = new Date(f.date);
  if (isNaN(d.getTime())) return "Invalid date.";
  if (d.getFullYear() < 2000) return "Date seems too far in the past.";
  if (d.getFullYear() > 2100) return "Date seems too far in the future.";
  if (!f.category) return "Please select a category.";
  return null;
}

export default function ExpenseForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        amount: editing.amount,
        date: editing.date,
        category: editing.category,
        note: editing.note || "",
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCategory = (cat) => setForm((f) => ({ ...f, category: cat }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, amount: Number(form.amount).toFixed(2) };
      if (editing) await updateExpense(editing.id, payload);
      else await createExpense(payload);
      setForm(EMPTY);
      onSaved();
    } catch (ex) {
      const detail = ex.response?.data;
      if (detail && typeof detail === "object") {
        const msgs = Object.entries(detail)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msgs);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-heading">
        {editing ? "Edit expense" : "Quick add"}
      </h2>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="form-group">
        <label htmlFor="exp-title">What did you spend on?</label>
        <input
          id="exp-title"
          type="text"
          value={form.title}
          onChange={set("title")}
          placeholder="Coffee, groceries, rent…"
          maxLength={200}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="exp-amount">Amount (₹)</label>
          <input
            id="exp-amount"
            type="number"
            className="input-amount"
            value={form.amount}
            onChange={set("amount")}
            placeholder="0"
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="exp-date">Date</label>
          <input id="exp-date" type="date" value={form.date} onChange={set("date")} />
        </div>
      </div>

      <div className="form-group">
        <span className="label-text">Category</span>
        <div className="category-grid" role="group" aria-label="Category">
          {CATEGORIES.map((c) => {
            const meta = CAT_META[c];
            const active = form.category === c;
            return (
              <button
                key={c}
                type="button"
                className={`cat-pill${active ? " cat-pill--active" : ""}`}
                style={active ? { borderColor: meta.color, background: meta.bg } : undefined}
                onClick={() => setCategory(c)}
                aria-pressed={active}
              >
                <span className="cat-pill-emoji">{meta.emoji}</span>
                <span className="cat-pill-label">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="exp-note">Note <span className="optional">optional</span></label>
        <textarea
          id="exp-note"
          value={form.note}
          onChange={set("note")}
          rows={2}
          placeholder="Add context…"
        />
      </div>

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : editing ? "Save changes" : "Add expense"}
      </button>
      {editing && (
        <button className="btn btn-ghost btn-full" type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
