import { Appbar } from "../Components/Appbar"
import { Balance } from "../Components/Balance"
import { Users } from "../Components/Users";
import { useEffect, useState } from "react"
import api from "../API/api";


export const Dashboard = () => {
    const [balance, setBalance] = useState("");
    useEffect(() => {
        api.get("/api/v1/account/balance", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } },).then(response => {
            setBalance(response.data.accountBalance)
       })   
},[]) 
    return (
        <div>
            <Appbar/>
            <div className="p-10">
                <Balance value={balance}/>
            <Users/>
            </div>
        </div>
    )
}

