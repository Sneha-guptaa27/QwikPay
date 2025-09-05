import React, { useEffect, useState } from "react";
import ExpenseList from "../Components/ExpenseList";
import ExpenseForm from "../Components/ExpenseForm";
import ExpenseUpload from "../Components/ExpenseUpload";

const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={
      "px-4 py-2 rounded-xl border text-sm transition " +
      (active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50 border-gray-300")
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
    const onChanged = () => setReload((x) => x + 1);
    window.addEventListener("expenses:changed", onChanged);
    return () => window.removeEventListener("expenses:changed", onChanged);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Expenses</h1>
            <p className="text-gray-600 text-sm">
              Add manually, upload bill (OCR), or import your bank statement. Everything shows up below.
            </p>
          </div>
          <div className="flex gap-2">
            <Tab active={tab === "manual"} onClick={() => setTab("manual")}>Manual Entry</Tab>
            <Tab active={tab === "ocr"} onClick={() => setTab("ocr")}>Upload Bill (OCR)</Tab>
            <Tab active={tab === "bank"} onClick={() => setTab("bank")}>Import Statement</Tab>
          </div>
        </header>

        {tab === "manual" && (
          <Card title="Add Expense Manually">
            <ExpenseForm />
          </Card>
        )}

        {tab === "ocr" && (
          <Card title="Upload Bill for OCR" right={<span className="text-xs text-gray-500">Parse a bill and create an expense</span>}>
            <ExpenseUpload mode="ocr" />
          </Card>
        )}

        {tab === "bank" && (
          <Card title="Import Bank Statement (.xls/.xlsx/.csv)" right={<span className="text-xs text-gray-500">Create expenses from your statement</span>}>
            <ExpenseUpload mode="bank" />
          </Card>
        )}

        <Card title="All Expenses">
          <ExpenseList key={reload} />
        </Card>
      </div>
    </div>
  );
};

export default Expenses;
