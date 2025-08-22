import { CiBank } from "react-icons/ci";
import { SiRazorpay } from "react-icons/si";
import { FaHistory } from "react-icons/fa";
import { GiExpense } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { ClickableText } from "./ClickableText";
import { ClickableLinks } from "./ClickableLinks";

const quickLinks = [
        {
        icon: <CiBank/>,
        label: "Create A/c",
        page:"/accountCreation"
        
        },
        {
            icon: <SiRazorpay/>,
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
                        <div className="mt-[4px] text-white font-bold "><ClickableLinks buttonText={item.label} to={item.page}/></div>
            </div>
                )
        )
    }
    </div>
        );
}

 
    // <Link onClick={item.page}>{item.label}</Link>