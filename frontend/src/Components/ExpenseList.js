import { useEffect, useMemo, useState, useCallback } from "react";
import api from "../API/api";
import { Input } from "./Input";
import Table from "./Table/Table";
import TablePagination from "./Table/TablePagination";

const inr = v =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(v || 0);

const LIMIT = 10;

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
    payee: "",
    min: "",
    max: "",
  });

  const fetchExpenses = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;

    const { data } = await api.get("/expense/list", {
      params: {
        ...filters,
        page: currentPage,
        limit: LIMIT,
      },
    });

    setExpenses(data.items || []);
    setTotalPages(data.totalPages || 1);
    setTotalCount(data.total || 0);
    if (reset) setPage(1);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const total = useMemo(
    () =>
      expenses.reduce((s, r) => s + (r.amount ?? 0) / 100, 0),
    [expenses]
  );

  const columns = [
    {
      key: "date",
      label: "Date",
      render: r => new Date(r.date).toISOString().slice(0, 10),
    },
    {
      key: "title",
      label: "About",
      render: r => r.title || r.description || "—",
    },
    {
      key: "category",
      label: "Category",
      render: r => r.category || "—",
    },
    {
      key: "payee",
      label: "Payee",
      render: r => r.payee || "—",
    },
    {
      key: "amount",
      label: "Amount",
      render: r => (
        <span className="font-semibold">{inr(r.amount / 100)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div
        className="grid grid-cols-2 md:grid-cols-7 gap-2 p-4 rounded-xl"
        style={{ background: "#F9F3EF", border: "1px solid #456882" }}
      >
        <Input type="date" onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        <Input type="date" onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
        <Input placeholder="Category" onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} />
        <Input placeholder="Payee" onChange={e => setFilters(f => ({ ...f, payee: e.target.value }))} />
        <Input type="number" placeholder="Min ₹" onChange={e => setFilters(f => ({ ...f, min: e.target.value }))} />
        <Input type="number" placeholder="Max ₹" onChange={e => setFilters(f => ({ ...f, max: e.target.value }))} />

        <button
          onClick={() => fetchExpenses(true)}
          className="px-3 py-2 rounded-lg font-semibold text-white"
          style={{ background: "#1B3C53" }}
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-[#456882] bg-white">
        <div className="flex justify-between p-4 bg-[#F9F3EF] text-sm text-[#1B3C53]">
          <span>{loading ? "Loading…" : `Showing ${expenses.length} of ${totalCount}`}</span>
          <span>Total: {inr(total)}</span>
        </div>

        <Table columns={columns} data={expenses} />

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default ExpenseList;
