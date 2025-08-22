import { FaExchangeAlt, FaHistory, FaHome, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';



export const Sidebar = () => {
    return (
      
        <div className="h-screen w-[220px] bg-white  ">
            <div className="flex flex-col bg-primary h-full ">
                <div className="flex  p-[20px] font-bold text-l space-x-3 mt-[20px]">
                     <div className="mt-[2px]"><FaHome /></div>
                    <div><Link>HOME</Link></div>
                </div>
                <div className="flex  p-[20px] font-bold text-l space-x-3">
                    <div className="mt-[2px]"><FaSearch/></div>
                    <div><Link>EXPLORE</Link></div>
                </div>
                  <div className="flex  p-[20px] font-bold text-l space-x-3">
                    <div className="mt-[2px]"><FaExchangeAlt/></div>
                    <div><Link>TRANSFER</Link></div>
                </div>
                  <div className="flex p-[20px] font-bold text-l space-x-3">
                    <div className="mt-[2px]"><FaHistory/></div>
                    <div><Link>TRANSACTIONS</Link></div>
                </div>
            </div>
             </div>
    );
};