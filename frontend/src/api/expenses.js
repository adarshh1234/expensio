import axios from "axios";

// Uses Vite dev proxy (/api → localhost:8000). See frontend/vite.config.js
const api = axios.create({
  baseURL: "/api",
});

export const getExpenses = (params = {}) =>
  api.get("/expenses/", { params }).then((r) => r.data);

export const createExpense = (data) =>
  api.post("/expenses/", data).then((r) => r.data);

export const updateExpense = (id, data) =>
  api.patch(`/expenses/${id}/`, data).then((r) => r.data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}/`);

export const getSummary = (year, month) =>
  api.get("/expenses/summary/", { params: { year, month } }).then((r) => r.data);
