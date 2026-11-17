import axiosBaseUrl from "../../interceptor";

export const getDashboard = (month) => axiosBaseUrl.get(`/dashboard?month=${month}`);

export const addExpense = (expense) => axiosBaseUrl.post("/expenses", expense);
export const updateExpense = (id, changes) => axiosBaseUrl.put(`/expenses/${id}`, changes);
export const deleteExpense = (id) => axiosBaseUrl.delete(`/expenses/${id}`);

export const setBudget = (month, amount) => axiosBaseUrl.put(`/budgets/${month}`, amount );
