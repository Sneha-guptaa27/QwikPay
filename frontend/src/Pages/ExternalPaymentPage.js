import React from "react";

import { Appbar } from "../Components/Appbar";
import { ExternalPayment } from "../Components/SendMoneyExternal";
import { Sidebar } from "../Components/Siderbar";



const ExternalPaymentPage = () => {
  return (
     <div className="min-h-screen w-full flex flex-col bg-gray-50">
          <Appbar />
    
          <div className="flex flex-1">
            <Sidebar />

        <div className="flex-1 flex justify-center items-start mt-10">
          <ExternalPayment />
        </div>

      </div>
    </div>
  );
};

export default ExternalPaymentPage;
