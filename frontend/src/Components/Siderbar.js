import {
  FaExchangeAlt,
  FaHistory,
  FaHome,
  FaSearch,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const { pathname } = useLocation();

  const menu = [
    { label: "HOME", path: "/HomePage", icon: <FaHome /> },
    { label: "SPLITWISE", path: "/split", icon: <FaSearch /> },
    { label: "TRANSFER", path: "/payMoney", icon: <FaExchangeAlt /> },
    { label: "TRANSACTIONS", path: "/paymentHistory", icon: <FaHistory /> },
  ];

  return (
    <aside className="w-[220px] min-h-screen bg-[#fafafa] border-r">
      <div className="px-6 py-6 text-xl font-bold text-[#1f3a4d]">
        Qwikpay
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {menu.map(item => {
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-[#2f5d73] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#e2e8f0]"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
