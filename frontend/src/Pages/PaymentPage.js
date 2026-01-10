import React from 'react'
import { SendMoney } from "../Components/SendMoneyInternal";
import { Appbar } from '../Components/Appbar';
import { Sidebar } from "../Components/Siderbar";



const PaymentPage = () => {
  return (
     <div className="min-h-screen w-full flex flex-col bg-gray-50">
          <Appbar />
    
          <div className="flex flex-1">
            <Sidebar />

        <div className="flex-1 flex justify-center items-start mt-10">
          <SendMoney />
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;