import { useEffect, useState } from "react";
import { getcurrDate } from "../utils/Date";
import axios from "axios";
import { QuickLinks } from "./QuickLinks";
import SideCard from "./SideCard";
import { jwtDecode } from "jwt-decode";


export const MainCard = () => {
  const [balance, setBalance] = useState("");
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
  // useEffect(() => {
  //   axios
  //     .get("http://localhost:3000/api/v1/account/balance", {
  //       headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  //     })
  //     .then((response) => {
  //       setBalance(response.data.accountBalance);
  //     });
  // });
  //  if (!userData) {
  //   return <div className="text-2xl text-red-500">Loading user...</div>;
  // }
  return (
    <div>
      <div className="text-3xl font-semibold text-secondary">{greeting()}</div>
      <div className="flex">
        <div className=" w-[750px] h-[500px] rounded-2xl mt-[10px] bg-gradient-to-r from-secondary  to-third ">
          <div className="flex justify-between p-[60px]  text-white">
            <div className="flex flex-col">
              <div>Current Balance</div>
              <div>{balance}</div>
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
