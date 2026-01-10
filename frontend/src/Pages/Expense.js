import React, { useEffect, useState } from "react";
import ExpenseList from "../Components/ExpenseList";
import ExpenseForm from "../Components/ExpenseForm";
import ExpenseUpload from "../Components/ExpenseUpload";
import { Appbar } from "../Components/Appbar";
import { Sidebar } from "../Components/Siderbar";

const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={
      "px-4 py-2 rounded-xl border text-sm transition " +
      (active
        ? "bg-[#2f5d73] text-white border-[#2f5d73]"
        : "bg-white hover:bg-gray-50 border-gray-300 text-[#475569]")
    }
  >
    {children}
  </button>
);

const Card = ({ title, right, children }) => (
  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const Expenses = () => {
  const [tab, setTab] = useState("manual");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const onChanged = () => setReload(x => x + 1);
    window.addEventListener("expenses:changed", onChanged);
    return () => window.removeEventListener("expenses:changed", onChanged);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <Appbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1f3a4d]">
                  My Expenses
                </h1>
                <p className="text-sm text-[#475569]">
                  Add manually, upload bill (OCR), or import your bank statement.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                <Tab active={tab === "manual"} onClick={() => setTab("manual")}>
                  Manual Entry
                </Tab>
                <Tab active={tab === "ocr"} onClick={() => setTab("ocr")}>
                  Upload Bill (OCR)
                </Tab>
                <Tab active={tab === "bank"} onClick={() => setTab("bank")}>
                  Import Statement
                </Tab>
              </div>
            </header>

            {/* Content */}
            {tab === "manual" && (
              <Card title="Add Expense Manually">
                <ExpenseForm />
              </Card>
            )}

            {tab === "ocr" && (
              <Card
                title="Upload Bill for OCR"
                right={<span className="text-xs text-gray-500">Parse a bill and create an expense</span>}
              >
                <ExpenseUpload mode="ocr" />
              </Card>
            )}

            {tab === "bank" && (
              <Card
                title="Import Bank Statement"
                right={<span className="text-xs text-gray-500">Create expenses from your statement</span>}
              >
                <ExpenseUpload mode="bank" />
              </Card>
            )}

            {/* Expense List */}
            <Card title="All Expenses">
              <ExpenseList key={reload} />
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Expenses;
