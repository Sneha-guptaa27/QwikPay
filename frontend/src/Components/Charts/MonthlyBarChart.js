import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../API/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function monthLabel(m) {
  const [mm, yyyy] = String(m).split("-");
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default function MonthlyBarChart() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/analytics/by-month");
        setRows(data || []);
      } catch {
        setErr("Failed to load monthly analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = useMemo(() => ({
  labels: rows.map(r => monthLabel(r.month)),
  datasets: [
    {
      label: "Money Spent (₹)",
      data: rows.map(r => r.total),
      backgroundColor: "#2f5d73",      // 🔵 muted blue (theme)
      hoverBackgroundColor: "#244a5d", // darker blue
      borderRadius: 12,
      maxBarThickness: 38,
    },
  ],
}), [rows]);


const options = {
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `₹ ${ctx.parsed.y.toLocaleString("en-IN")}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#475569" },
    },
    y: {
      beginAtZero: true,
      grid: { color: "#e2e8f0" },
      ticks: {
        color: "#475569",
        callback: v => `₹ ${v.toLocaleString("en-IN")}`,
      },
    },
  },
};


  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!rows.length) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <div className="p-4 rounded-2xl shadow bg-white h-[420px]">
      <h3 className="text-lg font-semibold mb-3">Monthly Spending</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
