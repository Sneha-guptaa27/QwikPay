import React, { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
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
      } catch (e) {
        setErr("Failed to load monthly analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = useMemo(() => {
    const labels = rows.map(r => monthLabel(r.month));
    const values = rows.map(r => r.total); // already positive "spend"
    return {
      labels,
      datasets: [
        {
          label: "₹ per Month",
          data: values,
          backgroundColor: "rgba(37, 99, 235, 0.75)",     // blue-600
          hoverBackgroundColor: "rgba(37, 99, 235, 0.95)", // darker on hover
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  }, [rows]);

  const options = useMemo(
    () => ({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx =>
              `₹ ${ctx.parsed.y.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#6b7280",
            font: { size: 12 },
            callback: v => `₹ ${Number(v).toLocaleString("en-IN")}`,
          },
          grid: { color: "rgba(107,114,128,0.2)" },
        },
        x: {
          ticks: { color: "#6b7280", font: { size: 12 } },
          grid: { color: "rgba(107,114,128,0.08)" },
        },
      },
    }),
    []
  );

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!rows.length) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <h3 className="text-lg font-semibold mb-3">Monthly Spending</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
