import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [expenseBudget, setExpenseBudget] = useState("");

  useEffect(() => {
    const savedBudget = localStorage.getItem("expenseBudget");
    if (savedBudget) {
      setExpenseBudget(savedBudget);
    }
  }, []);

  return (
    <UserContext.Provider value={{ expenseBudget, setExpenseBudget }}>
      {children}
    </UserContext.Provider>
  );
}
