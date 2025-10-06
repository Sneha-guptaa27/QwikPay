import React from 'react'
import { Sidebar } from '../Components/Siderbar'
import { Navbar } from '../Components/Navbar'
import { Appbar } from '../Components/Appbar'
import { MainCard } from '../Components/MainCard'
import { useSearchParams } from 'react-router-dom'
import CategoryPieChart from '../Components/Charts/CategoryPieChart'
import MonthlyBarChart from '../Components/Charts/MonthlyBarChart'

export const HomePage = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="h-full w-full flex flex-col relative">
      <Appbar />
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col ml-[40px] mt-[40px] gap-6 pr-6">
          <div className="mt-[15px]">
            <MainCard />
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryPieChart />
            <MonthlyBarChart />
          </div>
        </div>
      </div>
    </div>
  )
}

