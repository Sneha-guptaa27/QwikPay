import axios from "axios"
import { Appbar } from "../Components/Appbar"
import { Balance } from "../Components/Balance"
import { Users } from "../Components/Users"
import { useState } from "react"

export const Dashboard = () => {

    return (
        <div>
            <Appbar />
            <div className="p-10">
                <Balance value={"10000"} />
            <Users/>
            </div>
        </div>
    
    )
}
