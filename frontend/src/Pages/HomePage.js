import React from "react";
import { Sidebar } from "../Components/Siderbar";
import { Appbar } from "../Components/Appbar";
import { MainCard } from "../Components/MainCard";
import CategoryPieChart from "../Components/Charts/CategoryPieChart";
import MonthlyBarChart from "../Components/Charts/MonthlyBarChart";
import MonthlyIncomeBarChart from "../Components/Charts/MonthlyIncomeBarChart";

export const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Appbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* MAIN CONTENT */}
        <div className="flex-1 px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">

            {/* Main card */}
            <MainCard />

            {/* Row 1: Pie + Monthly Spend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart />
              <MonthlyBarChart />
            </div>

            {/* Row 2: Income (centered) */}
            <div className="flex justify-center">
              <div className="w-full lg:w-2/3">
                <MonthlyIncomeBarChart />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
