import { useEffect, useMemo, useState } from "react";
import api from "../API/api";

const inr = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
    payee: "",
    min: "",
    max: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expense/list", { params: filters });
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const total = useMemo(
    () =>
      expenses.reduce((s, r) => {
        const paise = Number(r.amount ?? r.amountPaise ?? 0);
        return s + paise / 100;
      }, 0),
    [expenses]
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div
        className="grid grid-cols-2 md:grid-cols-7 gap-2 items-end p-4 rounded-xl"
        style={{ background: "#F9F3EF", border: "1px solid #456882" }}
      >
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="px-3 py-2 rounded-lg w-full"
          style={{ border: "1px solid #456882" }}
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="px-3 py-2 rounded-lg w-full"
          style={{ border: "1px solid #456882" }}
        />
        <input
          type="text"
          placeholder="Food / Travel / Bills"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 rounded-lg w-full"
          style={{ border: "1px solid #456882" }}
        />
        <input
          type="text"
          placeholder="Merchant / Person"
          value={filters.payee}
          onChange={(e) => setFilters({ ...filters, payee: e.target.value })}
          className="px-3 py-2 rounded-lg w-full"
          style={{ border: "1px solid #456882" }}
        />
        <input
          type="number"
          placeholder="Min ₹"
          value={filters.min}
          onChange={(e) => setFilters({ ...filters, min: e.target.value })}
          className="px-3 py-2 rounded-lg w-full"
          style={{ border: "1px solid #456882" }}
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={filters.max}
          onChange={(e) => setFilters({ ...filters, max: e.target.value })}
          className="px-3 py-2 rounded-lg w-full"
          style={{ border: "1px solid #456882" }}
        />
        <button
          onClick={fetchExpenses}
          className="px-3 py-2 rounded-lg font-semibold"
          style={{ background: "#1B3C53", color: "#fff" }}
        >
          Apply Filters
        </button>
      </div>

      {/* Expense Table */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ border: "1px solid #456882", background: "#fff" }}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ background: "#F9F3EF", borderBottom: "1px solid #456882" }}
        >
          <div className="text-sm" style={{ color: "#1B3C53" }}>
            {loading ? "Loading…" : `${expenses.length} expenses`}
          </div>
          <div className="text-sm font-medium" style={{ color: "#1B3C53" }}>
            Total: {inr(total)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ background: "#F9F3EF", borderBottom: "1px solid #456882" }}>
                <th className="px-4 py-3 text-left" style={{ color: "#1B3C53" }}>Date</th>
                <th className="px-4 py-3 text-left" style={{ color: "#1B3C53" }}>About</th>
                <th className="px-4 py-3 text-left" style={{ color: "#1B3C53" }}>Category</th>
                <th className="px-4 py-3 text-left" style={{ color: "#1B3C53" }}>Payee</th>
                <th className="px-4 py-3 text-left" style={{ color: "#1B3C53" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, i) => {
                const about = exp.title || exp.description || "—";
                const dateStr = exp.date ? new Date(exp.date).toISOString().slice(0, 10) : "—";
                const amountInRupees =
                  typeof exp.amount === "number"
                    ? exp.amount / 100
                    : typeof exp.amountPaise === "number"
                    ? exp.amountPaise / 100
                    : 0;
                return (
                  <tr
                    key={exp._id || i}
                    style={{ borderTop: "1px solid #456882", background: i % 2 ? "#F9F3EF" : "#fff" }}
                  >
                    <td className="px-4 py-3">{dateStr}</td>
                    <td className="px-4 py-3">{about}</td>
                    <td className="px-4 py-3">
                      {exp.category ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: "#F9F3EF",
                            border: "1px solid #456882",
                            color: "#1B3C53",
                          }}
                        >
                          {exp.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{exp.payee || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{inr(amountInRupees)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#F9F3EF", borderTop: "1px solid #456882" }}>
                <td className="px-4 py-3" colSpan={4} style={{ color: "#1B3C53" }}>
                  Total
                </td>
                <td className="px-4 py-3 font-semibold">{inr(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
