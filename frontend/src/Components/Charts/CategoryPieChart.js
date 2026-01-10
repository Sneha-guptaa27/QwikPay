import React, { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../../API/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  "rgba(47, 93, 115, 0.9)", // Grocery – muted blue
  "rgba(14, 165, 164, 0.9)", // Food – teal
  "rgba(95, 179, 179, 0.9)", // Utilities – soft teal
  "rgba(217, 119, 6, 0.9)",  // Fuel – muted amber
  "rgba(99, 102, 241, 0.85)", // Rent – indigo muted
  "rgba(220, 38, 38, 0.85)",  // Fees – soft red
];


export default function CategoryPieChart() {
  const now = new Date();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [month, setMonth] = useState(now.getMonth() + 1); // 1–12
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const { data } = await api.get(
          `/analytics/by-category?month=${month}&year=${year}`
        );

        setRows(data || []);
      } catch (e) {
        setErr("Failed to load category analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [month, year]);

  const chartData = useMemo(() => {
  const labels = rows.map(r => r.category || "Uncategorized");
  const values = rows.map(r => r.total);

  return {
    labels,
    datasets: [
      {
        label: "₹ by Category",
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: "#f8fafc", // soft white
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };
}, [rows]);


const options = useMemo(
  () => ({
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#475569", // slate
          font: { size: 13, weight: "500" },
          boxWidth: 14,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        padding: 10,
        callbacks: {
          label: ctx =>
            `₹ ${ctx.parsed.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
  }),
  []
);


  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Spending by Category</h3>

        {/* Month Selector */}
        <div className="flex gap-2">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "short" })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {!loading && !rows.length && (
        <div className="text-sm text-gray-500">No data</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-center h-[300px]">
  <Pie data={chartData} options={options} />
</div>

      )}
    </div>
  );
}
