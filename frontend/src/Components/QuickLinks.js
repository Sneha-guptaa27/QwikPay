import { CiBank } from "react-icons/ci";
import { SiRazorpay } from "react-icons/si";
import { FaHistory } from "react-icons/fa";
import { GiExpense } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { ClickableText } from "./ClickableText";
import { ClickableLinks } from "./ClickableLinks";
<<<<<<< Updated upstream
=======
import { FaAmazonPay } from "react-icons/fa";
>>>>>>> Stashed changes

const quickLinks = [
        {
        icon: <CiBank/>,
        label: "Create A/c",
        page:"/accountCreation"
        
        },
        {
            icon: <SiRazorpay/>,
<<<<<<< Updated upstream
            label: "Pay",
            page:"/dashboard"
    },
          {
            icon: <FaHistory/>,
            label:"History"
    },
          {
            icon: <GiExpense/>,
            label:`Expense Tracker`
=======
            label: "Pay Through Qwikpay",
            page:"/payMoney"
    },
          {
            icon: <FaHistory/>,
              label: "History",
            page:"/paymentHistory"
    },
          {
            icon: <GiExpense/>,
              label: "Expense Tracker",
            page:"/expense"
    },
           {
            icon: <FaAmazonPay/>,
               label: `Pay Externally`,
            page:'/payMoneyExternally'
>>>>>>> Stashed changes
    },
        
    ]  
export const QuickLinks = () => {
    const navigate = useNavigate();
    return (
        <div className="flex w-[700px] justify-between gap-8 ">
            {
                quickLinks.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-x-1 ">
                        <div className="h-[70px] w-[70px] rounded-full bg-white justify-items-center text-3xl p-[20px]">{item.icon}</div>
<<<<<<< Updated upstream
                        <div className="mt-[4px] text-white font-bold "><ClickableLinks buttonText={item.label} to={item.page}/></div>
=======
                        <div className="mt-[4px] text-white font-bold text-center "><ClickableLinks buttonText={item.label} to={item.page}/></div>
>>>>>>> Stashed changes
            </div>
                )
        )
    }
    </div>
        );
}

 
    // <Link onClick={item.page}>{item.label}</Link>