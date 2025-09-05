<<<<<<< Updated upstream
import React from 'react'
=======
import React, { useMemo } from 'react'
>>>>>>> Stashed changes
import { Sidebar } from '../Components/Siderbar'
import { Navbar } from '../Components/Navbar'
import { Appbar } from '../Components/Appbar'
import { MainCard } from '../Components/MainCard'
<<<<<<< Updated upstream

export const HomePage = () => {
=======
import { useSearchParams } from 'react-router-dom'

export const HomePage = () => {
  const [searchParams] = useSearchParams();

>>>>>>> Stashed changes
  return (
    <div className="h-full w-full flex flex-col relative">
      <Appbar />
      <div className='flex ' >
        <Sidebar />
        <div className="flex flex-col ml-[40px] mt-[40px]">
<<<<<<< Updated upstream
         <div className="mt-[15px]"><MainCard/></div>
=======
          <div className="mt-[15px]"><MainCard/></div>
>>>>>>> Stashed changes
      </div>
      </div>
    </div>
      
  )
}


