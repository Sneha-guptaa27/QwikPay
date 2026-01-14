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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthlyIncomeBarChart() {
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    (async () => {
      const { data } = await api.get(
        `/analytics/monthly-income?year=${year}`
      );
      setRows(data || []);
    })();
  }, [year]);

  const chartData = useMemo(() => {
  const values = Array(12).fill(0);
  rows.forEach(r => (values[r.month - 1] = r.total));

  return {
    labels: MONTHS,
    datasets: [
      {
        label: "Money Received (₹)",
        data: values,
        backgroundColor: "#0ea5a4",      // 🟢 teal (theme accent)
        hoverBackgroundColor: "#0f766e", // darker teal
        borderRadius: 12,
        maxBarThickness: 38,
      },
    ],
  };
}, [rows]);


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


  return (
    <div className="p-4 bg-white rounded-2xl shadow h-[420px]">
      <div className="flex justify-between mb-3 items-center">
        <h3 className="text-lg font-semibold">Money Received!</h3>

        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <Bar data={chartData} options={options} />
    </div>
  );
}
//