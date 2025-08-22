import React from 'react'
import { Sidebar } from '../Components/Siderbar'
import { Navbar } from '../Components/Navbar'
import { Appbar } from '../Components/Appbar'
import { MainCard } from '../Components/MainCard'

export const HomePage = () => {
  return (
    <div className="h-full w-full flex flex-col relative">
      <Appbar />
      <div className='flex ' >
        <Sidebar />
        <div className="flex flex-col ml-[40px] mt-[40px]">
         <div className="mt-[15px]"><MainCard/></div>
      </div>
      </div>
    </div>
      
  )
}


