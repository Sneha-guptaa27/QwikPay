import axios from "axios"
import { Appbar } from "../Components/Appbar"
import { Balance } from "../Components/Balance"
<<<<<<< Updated upstream
import { Users } from "../Components/Users"
=======
import { Users } from "../Components/Users";
>>>>>>> Stashed changes
import { useEffect, useState } from "react"


export const Dashboard = () => {
    const [balance, setBalance] = useState("");
    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } },).then(response => {
            setBalance(response.data.accountBalance)
<<<<<<< Updated upstream
       })
        
},[]) 
    return (
        <div>
            <Appbar />
            <div className="p-10">
                <Balance value={balance} />
            <Users/>
            </div>
        </div>
    
=======
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
>>>>>>> Stashed changes
    )
}

