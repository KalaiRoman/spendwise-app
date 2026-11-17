export const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const CATS = ["Food", "Rent", "Travel", "Bills", "Shopping", "Health", "Other"];

const pad = (n) => String(n).padStart(2, "0");

export const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// "2026-11" for today
export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

// "2026-11-12" for today in the user's own timezone (not UTC)
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// shiftMonth("2026-12", 1) -> "2027-01"
export const shiftMonth = (month, step) => {
  let [y, m] = month.split("-").map(Number);
  m += step;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  return `${y}-${pad(m)}`;
};

export const monthName = (month) => MN[Number(month.slice(5, 7)) - 1];
