import { useCallback, useEffect, useState } from "react";
import * as dashboardApi from "../api/dashboardApi";
import { currentMonth } from "../utils/format";

export default function useDashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await dashboardApi.getDashboard(month));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  // Reload whenever the month changes
  useEffect(() => { setLoading(true); load(); }, [load]);

  // Hide the toast after 2.5s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Runs an API call, refreshes the dashboard, shows a message
  const run = async (fn, message) => {
    try {
      await fn();
      await load();
      setToast(message);
    } catch (e) {
      setToast(e.message);
    }
  };

  const saveBudget = (amount) => run(() => dashboardApi.setBudget(month, amount), "Budget saved");
  const removeExpense = (id) => run(() => dashboardApi.deleteExpense(id), "Expense deleted");

  // Throws on failure so the modal can show the error and stay open
  const addExpense = async (expense) => {
    await dashboardApi.addExpense(expense);
    const m = expense.date.slice(0, 7);
    if (m !== month) setMonth(m);   // jump to the month that got the expense
    else await load();
    setToast("Expense added");
  };

  return { month, setMonth, data, loading, error, toast, reload: load, saveBudget, addExpense, removeExpense };
}
