import React from "react";
import { Navbar } from "../Components/Navbar";
import landing from "../Assets/Images/landing.jpg"

export const LandingPage = () => {
  return (
    <div className=" flex flex-col h-screen w-screen  bg-primary ">
      <div className="w-screen">
        <Navbar />
      </div>
      <div className="flex relative w-full ">
        <div className="bg-third h-[720px] w-[1000px] ml-10 mt-6 border rounded-2xl flex ">
          <div className="flex flex-col  ">
            <div className="flex ml-[150px] text-8xl font-semibold mt-[100px] mr-[300px] text-amber-200">
              Fast,safe social payments
            </div>
            <div className="flex ml-[150px] font-medium mt-[30px] mr-[400px] text-lg text-white">
              Pay, get paid,grow a business,and more . Join the tens of millions
              of people on Qwikpay
            </div>
            <div className="ml-[150px] mt-[70px]">
              <button className="h-[50px] w-[170px] border-black bg-slate-950 text-white rounded-full font-normal text-xs shadow-md shadow-gray-50 ">
                Get Qwikpay
              </button>
            </div>
          </div>
        </div>
        <div className=" flex items-center bg-black">
          <img src={landing} className="h-[600px] w-[700px] rounded-xl -translate-x-80 mt-[143px] absolute object-cover"></img>
        </div>
      </div>
    </div>
  );
};
