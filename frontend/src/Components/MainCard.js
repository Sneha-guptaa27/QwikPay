import { use, useEffect, useState } from "react";
import { getcurrDate } from "../utils/Date";
import { QuickLinks } from "./QuickLinks";
import SideCard from "./SideCard";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { UserContext } from "../userContext";


export const MainCard = () => {
  const { expenseBudget }=useContext(UserContext);
  const token = localStorage.getItem("token");
  
  const greeting = () => {
    const ISTtime = getcurrDate();
    const hours = ISTtime.getHours();
    if (hours < 12) {
      return "GOOD MORNING";
    } else if (hours < 18) {
      return "GOOD AFTERNOON";
    } else {
      return "GOOD EVENING";
    }
  };
 
  return (
    <div>
      <div className="text-3xl font-semibold text-secondary">{greeting()}</div>
      <div className="flex">
        <div className=" w-[750px] h-[500px] rounded-2xl mt-[10px] bg-gradient-to-r from-secondary  to-third ">
          <div className="flex justify-between p-[60px]  text-white">
            <div className="flex flex-col">
              <div>Expense Budget</div>
              <div>{expenseBudget}</div>
            </div>
            <div>Expenses For This Month</div>
                  </div>
                  <div className="flex mx-[50px] my-[170px]">
                    <QuickLinks/>
                  </div>
        </div>
        <div>
          <SideCard/>
        </div>
      </div>
    </div>
  );
};
