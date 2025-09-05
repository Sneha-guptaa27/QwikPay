import React, { useEffect, useMemo, useState } from "react";
import api from "../API/api";
import { Heading } from "../Components/Heading";

const PRIMARY = "#F9F3EF";
const SECONDARY = "#456882";
const THIRD = "#1B3C53";

const inr = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);

export default function PaymentHistory() {
  const [accountId, setAccountId] = useState("");
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [filters, setFilters] = useState({
    kind: "all",       // all | sent | received
    method: "all",     // all | internal | upi | card | netbanking | wallet | mock
    status: "all",     // all | success | failed
    q: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const acc = await api.get("/account/getaccount", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = acc?.data?.[0]?._id || acc?.data?.accounts?.[0]?._id || "";
        setAccountId(id);

        if (!id) throw new Error("No account found");

        const res = await api.get("/payment/paymentHistory", { params: { accountId: id } });
        const rows = (res?.data?.transactions || []).map((t) => ({
          id: t._id || t.id,
          type: t.type,                    // debit | credit
          channel: (t.channel || "").toLowerCase(), // "internal" | "upi" | "netbanking" ...
          status: t.status || "success",
          amountPaise: Number(t.amount ?? 0),
          currency: t.currency || "INR",
          narrative: t.narrative || "",
          counterparty: t.counterparty || {},
          createdAt: t.createdAt,
        }));
        rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTxs(rows);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      // kind filter
      if (filters.kind === "sent" && t.type !== "debit") return false;
      if (filters.kind === "received" && t.type !== "credit") return false;

      // method filter
      if (filters.method !== "all") {
        const m = filters.method.toLowerCase();
        if ((m === "internal" ? "internal" : m) !== t.channel) return false;
      }

      // status
      if (filters.status !== "all" && (t.status || "").toLowerCase() !== filters.status) return false;

      // date
      if (filters.from && new Date(t.createdAt) < new Date(filters.from)) return false;
      if (filters.to && new Date(t.createdAt) > new Date(filters.to)) return false;

      // search
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const hay =
          `${t.narrative} ${t.channel} ${t.status} ${t.counterparty?.name || ""} ${t.counterparty?.upiId || ""} ${
            t.counterparty?.userId || ""
          }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [txs, filters]);

  const totalSent = useMemo(
    () => filtered.filter((t) => t.type === "debit").reduce((s, t) => s + t.amountPaise, 0) / 100,
    [filtered]
  );
  const totalRecv = useMemo(
    () => filtered.filter((t) => t.type === "credit").reduce((s, t) => s + t.amountPaise, 0) / 100,
    [filtered]
  );

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${PRIMARY}, #ffffff 30%)` }}>
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        {/* Header */}
        <div className="rounded-xl p-4" style={{ background: PRIMARY, border: `1px solid ${SECONDARY}` }}>
          <Heading title={"PAYMENT HISTORY"} />
          <div className="text-sm mt-2" style={{ color: THIRD }}>
            Account: <span className="font-mono">{accountId || "—"}</span>
          </div>
        </div>

        {/* Filters */}
        <div
          className="grid grid-cols-2 md:grid-cols-7 gap-2 items-end p-4 rounded-xl"
          style={{ background: "#fff", border: `1px solid ${SECONDARY}` }}
        >
          <select
            value={filters.kind}
            onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
            className="px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${SECONDARY}` }}
          >
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>

          <select
            value={filters.method}
            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
            className="px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${SECONDARY}` }}
          >
            <option value="all">All Methods</option>
            <option value="internal">Internal</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="netbanking">Netbanking</option>
            <option value="wallet">Wallet</option>
            <option value="mock">Mock</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${SECONDARY}` }}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${SECONDARY}` }}
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${SECONDARY}` }}
          />
          <input
            placeholder="Search text / UPI / name"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${SECONDARY}` }}
          />
          <button
            onClick={() => setFilters({ ...filters })}
            className="px-3 py-2 rounded-lg font-semibold"
            style={{ background: THIRD, color: "#fff" }}
          >
            Apply
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${SECONDARY}` }}>
            <div className="text-xs text-gray-600">Transactions</div>
            <div className="text-lg font-semibold" style={{ color: THIRD }}>{filtered.length}</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${SECONDARY}` }}>
            <div className="text-xs text-gray-600">Sent (debit)</div>
            <div className="text-lg font-semibold" style={{ color: THIRD }}>₹{totalSent.toFixed(2)}</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${SECONDARY}` }}>
            <div className="text-xs text-gray-600">Received (credit)</div>
            <div className="text-lg font-semibold" style={{ color: THIRD }}>₹{totalRecv.toFixed(2)}</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#fff", border: `1px solid ${SECONDARY}` }}>
            <div className="text-xs text-gray-600">Methods shown</div>
            <div className="text-lg font-semibold" style={{ color: THIRD }}>
              {filters.method === "all" ? "All" : filters.method}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${SECONDARY}`, background: "#fff" }}>
          <div
            className="flex items-center justify-between p-4"
            style={{ background: PRIMARY, borderBottom: `1px solid ${SECONDARY}` }}
          >
            <div className="text-sm" style={{ color: THIRD }}>
              {loading ? "Loading…" : `${filtered.length} transactions`}
              {err ? ` — ${err}` : ""}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: PRIMARY, borderBottom: `1px solid ${SECONDARY}` }}>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>Date</th>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>Direction</th>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>Method</th>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>Counterparty</th>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>About</th>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>Amount</th>
                  <th className="px-4 py-3 text-left" style={{ color: THIRD }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const sent = t.type === "debit";
                  const method = t.channel || "—";
                  const cp = t.counterparty?.name || t.counterparty?.upiId || t.counterparty?.userId || "—";
                  const amt = t.amountPaise / 100;

                  return (
                    <tr key={t.id || i} style={{ borderTop: `1px solid ${SECONDARY}`, background: i % 2 ? PRIMARY : "#fff" }}>
                      <td className="px-4 py-3">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: sent ? "rgba(199,68,68,0.10)" : "rgba(38,148,82,0.10)",
                            border: `1px solid ${SECONDARY}`,
                            color: sent ? "#b4231f" : "#137a41",
                          }}
                        >
                          {sent ? "Sent" : "Received"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: method === "internal" ? "rgba(27,60,83,0.10)" : "rgba(69,104,130,0.08)",
                            border: `1px solid ${SECONDARY}`,
                            color: THIRD,
                          }}
                        >
                          {method.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">{cp}</td>
                      <td className="px-4 py-3">{t.narrative || "—"}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: sent ? "#b4231f" : "#137a41" }}>
                        {sent ? "-" : "+"}
                        {inr(Math.abs(amt))}
                      </td>
                      <td className="px-4 py-3">{t.status || "—"}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ background: PRIMARY, borderTop: `1px solid ${SECONDARY}` }}>
                  <td className="px-4 py-3" colSpan={5} style={{ color: THIRD }}>
                    Totals
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span style={{ color: "#b4231f" }}>−{inr(totalSent)}</span>
                    {"  /  "}
                    <span style={{ color: "#137a41" }}>+{inr(totalRecv)}</span>
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
