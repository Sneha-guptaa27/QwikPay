import React, { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../../API/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ["#2563eb", "#0ea5a4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]; // blue → teal theme

export default function CategoryPieChart() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/analytics/by-category");
        setRows(data || []);
      } catch (e) {
        setErr("Failed to load category analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [rows]);

  const options = useMemo(
    () => ({
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#6b7280", font: { size: 13, weight: "500" } },
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              `₹ ${ctx.parsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
          },
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
      <h3 className="text-lg font-semibold mb-3">Spending by Category</h3>
      <Pie data={chartData} options={options} />
    </div>
  );
}
