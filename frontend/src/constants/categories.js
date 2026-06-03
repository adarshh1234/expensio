export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

export const CAT_META = {
  Food: { emoji: "🍔", color: "#d97706", bg: "#fff7ed", label: "Food" },
  Transport: { emoji: "🚌", color: "#2563eb", bg: "#eff6ff", label: "Transport" },
  Shopping: { emoji: "🛍️", color: "#7c3aed", bg: "#f5f3ff", label: "Shopping" },
  Bills: { emoji: "💡", color: "#dc2626", bg: "#fef2f2", label: "Bills" },
  Entertainment: { emoji: "🎬", color: "#059669", bg: "#ecfdf5", label: "Fun" },
  Other: { emoji: "📦", color: "#64748b", bg: "#f1f5f9", label: "Other" },
};

export function fmtCurrency(n) {
  return (
    "₹" +
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

export function fmtDateShort(s) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateGroup(s) {
  const d = new Date(s + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
