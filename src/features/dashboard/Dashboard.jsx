
import { useEffect, useState } from "react";
import "./Dashboard.css";

import useLoginStore from "../../reuseable/zustand/useLoginStore";

import {
  addExpense,
  getDashboard,
  setBudget,
} from "../../services/dashboardApi";

import { MdEdit } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CATS = [
  "Food",
  "Rent",
  "Travel",
  "Bills",
  "Shopping",
  "Health",
  "Petrol",
  "Vegatbles",
  "Medical",
  "Other",
];

const inr = (n) =>
  "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

const getLocalDate = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatMonth = (year, monthIdx) =>
  `${year}-${String(monthIdx + 1).padStart(2, "0")}`;

export default function DashboardDesign() {
  const today = new Date();

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [adding, setAdding] = useState(false);
  const [addingbug, setAddingBug] = useState(false);

  const [monthIdx, setMonthIdx] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const [getMonths, setGetMonths] = useState(null);

  const [add, setAdd] = useState({
    amount: "",
    category: "",
    note: "",
    date: getLocalDate(),
  });

  const [addBud, setAddBud] = useState({
    amountBud: "",
  });

  const { userData, userLogin } = useLoginStore();

  const { amount, category, note, date } = add;

  const selectedMonth = formatMonth(year, monthIdx);

  const budget = Number(getMonths?.budget) || 0;
  const spent = Number(getMonths?.spent) || 0;

  const balance = Number(
    getMonths?.balance ?? budget - spent
  );

  const over = balance < 0;

  const pct = budget > 0
    ? Math.min(100, (spent / budget) * 100)
    : 0;

  const isNextDisabled =
    year > currentYear ||
    (year === currentYear && monthIdx >= currentMonth);

  // =========================================
  // Dashboard API
  // =========================================

  const gatDashboardData = async (params = selectedMonth) => {
    try {
      const response = await getDashboard(params);

      if (response) {
        setGetMonths(response?.data);
      }
    } catch (error) {
      console.error("Dashboard API Error:", error);
    }
  };

  useEffect(() => {
    userLogin();
    gatDashboardData(selectedMonth);
  }, []);

  // =========================================
  // Previous Month
  // =========================================

  const handlePrevious = () => {
    let newMonth = monthIdx;
    let newYear = year;

    if (monthIdx === 0) {
      newMonth = 11;
      newYear = year - 1;
    } else {
      newMonth = monthIdx - 1;
    }

    setMonthIdx(newMonth);
    setYear(newYear);

    gatDashboardData(formatMonth(newYear, newMonth));
  };

  // =========================================
  // Next Month
  // =========================================

  const handleNext = () => {
    if (isNextDisabled) return;

    let newMonth = monthIdx;
    let newYear = year;

    if (monthIdx === 11) {
      newMonth = 0;
      newYear = year + 1;
    } else {
      newMonth = monthIdx + 1;
    }

    setMonthIdx(newMonth);
    setYear(newYear);

    gatDashboardData(formatMonth(newYear, newMonth));
  };

  // =========================================
  // Year At A Glance Month Selection
  // =========================================

  const handleSelectMonth = (m) => {
    if (!m?.month) return;

    const [newYear, monthNumber] = m.month.split("-").map(Number);

    const newMonth = monthNumber - 1;

    if (
      newMonth < 0 ||
      newMonth > 11 ||
      !Number.isInteger(newYear)
    ) return;

    if (
      newYear > currentYear ||
      (newYear === currentYear && newMonth > currentMonth)
    ) return;

    setYear(newYear);
    setMonthIdx(newMonth);

    gatDashboardData(formatMonth(newYear, newMonth));
  };

  // =========================================
  // Expense Input
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAdd((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // Add Expense
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await addExpense(add);

      if (response) {
        setAdd({
          amount: "",
          category: "",
          note: "",
          date: getLocalDate(),
        });

        setAdding(false);

        gatDashboardData(selectedMonth);
      }
    } catch (error) {
      console.error("Add Expense Error:", error);
    }
  };

  // =========================================
  // Budget Modal
  // =========================================

  const handleOpenBudget = () => {
    setAddBud({
      amountBud: String(getMonths?.budget ?? ""),
    });

    setAddingBug(true);
  };

  // =========================================
  // Add / Update Budget
  // =========================================

  const handleBudget = async (e) => {
    e.preventDefault();

    if (!addBud.amountBud || Number(addBud.amountBud) <= 0) {
      return;
    }

    try {
      const data = {
        amount: Number(addBud.amountBud),
      };

      const response = await setBudget(selectedMonth, data);

      if (response) {
        setAddingBug(false);

        setAddBud({
          amountBud: "",
        });

        gatDashboardData(selectedMonth);
      }
    } catch (error) {
      console.error("Budget Error:", error);
    }
  };

  // =========================================
  // DOWNLOAD MONTHLY EXPENSE PDF
  // =========================================

  const handleDownloadPDF = () => {
    if (!getMonths) {
      alert("No dashboard data available");
      return;
    }

    const expenses = getMonths?.expenses || [];
    const categories = getMonths?.categories || [];

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    // Report heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text("SPENDWISE", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text("Monthly Expense Report", 14, 28);

    doc.text(
      `Report Month: ${MN[monthIdx]} ${year}`,
      14,
      38
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      14,
      45
    );

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Monthly Summary", 14, 58);

    autoTable(doc, {
      startY: 63,

      head: [["Description", "Amount"]],

      body: [
        ["Total Budget", inr(budget)],
        ["Total Spent", inr(spent)],
        ["Remaining Balance", inr(balance)],
        ["Total Transactions", String(expenses.length)],
      ],

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 4,
      },

      headStyles: {
        fillColor: [35, 90, 65],
      },

      columnStyles: {
        1: {
          halign: "right",
        },
      },
    });

    // Category-wise breakdown
    let nextY = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Category-wise Expenses", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,

      head: [["Category", "Total Amount"]],

      body: categories.map((item) => [
        item.category || "-",
        inr(item.total),
      ]),

      theme: "striped",

      styles: {
        fontSize: 10,
      },

      headStyles: {
        fillColor: [35, 90, 65],
      },

      columnStyles: {
        1: {
          halign: "right",
        },
      },
    });

    // Individual expense details
    nextY = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Transaction Details", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,

      head: [[
        "Date",
        "Category",
        "Description",
        "Amount",
      ]],

      body: expenses.map((item) => [
        item.date
          ? new Date(item.date + "T00:00:00").toLocaleDateString("en-IN")
          : "-",

        item.category || "-",

        item.note || "-",

        inr(item.amount),
      ]),

      theme: "striped",

      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
      },

      headStyles: {
        fillColor: [35, 90, 65],
      },

      columnStyles: {
        3: {
          halign: "right",
        },
      },
    });

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text(
        `Spendwise | ${selectedMonth} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    // Download
    doc.save(`Spendwise-${selectedMonth}-Report.pdf`);
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="db-page">

      {/* Header */}

      <header className="db-top">

        <div className="db-brand">
          <span className="db-logo">
            <span />
          </span>
          Spendwise
        </div>

        <div className="db-user">

          <span className="db-avatar" aria-hidden="true">
            {userData?.user?.name?.[0] || ""}
          </span>

          <span className="db-name">
            {userData?.user?.name || ""}
          </span>

          <button className="db-ghost">
            Log out
          </button>

        </div>

      </header>

      <main className="db-wrap">

        {/* Dashboard Heading */}

        <div className="db-head">

          <div>
            <h1>
              Hi, {userData?.user?.name || ""}
            </h1>

            <p className="db-mute">
              Here is your spending for the month.
            </p>
          </div>

          {/* Month Navigation */}

          <div className="db-nav">

            <button
              onClick={handlePrevious}
              aria-label="Previous month"
            >
              ‹
            </button>

            <strong>
              {MN[monthIdx]} {year}
            </strong>

            <button
              onClick={handleNext}
              aria-label="Next month"
              disabled={isNextDisabled}
            >
              ›
            </button>

          </div>

        </div>

        {/* Download PDF Button */}

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}>

          <button
            className="db-btn"
            type="button"
            onClick={handleDownloadPDF}
            disabled={!getMonths}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            <FaFilePdf />

            Download {MN[monthIdx]} PDF

          </button>

        </div>

        {/* Monthly Budget Overview */}

        <section className="db-card db-hero">

          <p className="db-mute">
            {over
              ? "Over budget by"
              : "Balance left this month"}
          </p>

          <div className={"db-big" + (over ? " over" : "")}>
            {inr(Math.abs(balance))}
          </div>

          <div
            className="db-ledger"
            role="img"
            aria-label={`${Math.round(pct)}% of budget spent`}
          >

            <i style={{ width: pct + "%" }} />

            {!over && <b />}

          </div>

          <div className="db-legend">

            <span>
              {Math.round(pct)}% spent
            </span>

            <span>
              {Math.max(0, 100 - Math.round(pct))}% left
            </span>

          </div>

          {/* Budget Stats */}

          <div className="db-stats">

            <div
              className="db-stat b"
              style={{ cursor: "pointer" }}
              onClick={handleOpenBudget}
            >

              <small>
                Budget <MdEdit />
              </small>

              <b>
                {inr(budget)}
              </b>

            </div>

            <div className="db-stat s">

              <small>Spent</small>

              <b>{inr(spent)}</b>

            </div>

            <div className="db-stat l">

              <small>Balance</small>

              <b>{inr(balance)}</b>

            </div>

          </div>

          {/* Budget Modal */}

          {addingbug && (

            <div
              className="db-overlay"
              onClick={() => setAddingBug(false)}
            >

              <form
                className="db-sheet"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleBudget}
              >

                <h2>Add Budget</h2>

                <label>
                  Amount (₹)

                  <input
                    type="number"
                    placeholder="0"
                    autoFocus
                    value={addBud.amountBud}
                    onChange={(e) =>
                      setAddBud({
                        ...addBud,
                        amountBud: e.target.value,
                      })
                    }
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  Month

                  <input
                    type="month"
                    value={selectedMonth}
                    disabled
                    readOnly
                  />
                </label>

                <div className="db-actions">

                  <button
                    type="button"
                    className="db-ghost"
                    onClick={() => setAddingBug(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="db-btn"
                  >
                    Add Budget
                  </button>

                </div>

              </form>

            </div>

          )}

        </section>

        {/* Dashboard Grid */}

        <div className="db-grid">

          {/* Category Breakdown */}

          <section className="db-card">

            <h2>Where it went</h2>

            {getMonths?.categories?.map((c) => (

              <div className="db-cat" key={c.category}>

                <div>

                  <span>{c.category}</span>

                  <span>{inr(c.total)}</span>

                </div>

                <div className="db-bar">

                  <span
                    style={{
                      width:
                        (spent > 0
                          ? Math.min(100, (c.total / spent) * 100)
                          : 0) + "%",
                    }}
                  />

                </div>

              </div>

            ))}

            {!getMonths?.categories?.length && (
              <p className="db-mute">
                No expenses found for this month.
              </p>
            )}

          </section>

          {/* Year At A Glance */}

          <section className="db-card">

            <h2>Year at a glance</h2>

            {getMonths?.months?.map((m) => {

              const neg = m.balance < 0;

              const w = m.budget
                ? Math.min(100, (m.spent / m.budget) * 100)
                : 0;

              const monthNumber = Number(m.month?.split("-")[1]);

              return (

                <button
                  key={m.month}
                  className={
                    "db-mrow" +
                    (m.month === selectedMonth ? " on" : "")
                  }
                  onClick={() => handleSelectMonth(m)}
                  disabled={
                    Number(m.month?.split("-")[0]) > currentYear ||
                    (
                      Number(m.month?.split("-")[0]) === currentYear &&
                      monthNumber - 1 > currentMonth
                    )
                  }
                >

                  <span className="m">
                    {MN[monthNumber - 1]}
                  </span>

                  <span className="db-bar">

                    <span style={{ width: w + "%" }} />

                  </span>

                  <span className={"r" + (neg ? " neg" : "")}>

                    {m.budget || m.spent
                      ? (neg ? "−" : "") +
                        inr(Math.abs(m.balance))
                      : "0"}

                  </span>

                </button>

              );

            })}

          </section>

        </div>

        {/* Expense List */}

        <section className="db-card db-listcard">

          <h2>
            Expenses in {MN[monthIdx]} {year}
          </h2>

          <ul className="db-list">

            {getMonths?.expenses?.map((e) => {

              const expenseDate = e.date || "";
              const expenseMonth = Number(expenseDate.slice(5, 7));

              return (

                <li key={e._id}>

                  <div>

                    {e.note}

                    <small>
                      {e.category} ·{" "}
                      {expenseDate.slice(8, 10)}{" "}
                      {MN[expenseMonth - 1]}
                    </small>

                  </div>

                  <div className="end">

                    <span className="amt">
                      {inr(e.amount)}
                    </span>

                    <button
                      type="button"
                      aria-label={`Delete ${e.note}`}
                    >
                      ✕
                    </button>

                  </div>

                </li>

              );

            })}

          </ul>

          {!getMonths?.expenses?.length && (
            <p className="db-mute">
              No expenses found for this month.
            </p>
          )}

        </section>

      </main>

      {/* Add Expense Button */}

      <button
        className="db-fab"
        onClick={() => setAdding(true)}
      >
        + Add expense
      </button>

      {/* Add Expense Modal */}

      {adding && (

        <div
          className="db-overlay"
          onClick={() => setAdding(false)}
        >

          <form
            className="db-sheet"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >

            <h2>Add expense</h2>

            <label>
              Amount (₹)

              <input
                type="number"
                placeholder="0"
                autoFocus
                onChange={handleChange}
                value={amount}
                name="amount"
                min="0.01"
                step="0.01"
                required
              />
            </label>

            <label>
              Category

              <select
                onChange={handleChange}
                value={category}
                name="category"
                required
              >

                <option value="">
                  Select category
                </option>

                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}

              </select>

            </label>

            <label>
              Note (optional)

              <input
                placeholder="e.g. Groceries"
                onChange={handleChange}
                value={note}
                name="note"
              />
            </label>

            <label>
              Date

              <input
                type="date"
                onChange={handleChange}
                value={date}
                name="date"
                required
              />
            </label>

            <div className="db-actions">

              <button
                type="button"
                className="db-ghost"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="db-btn"
              >
                Add expense
              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  );
}
