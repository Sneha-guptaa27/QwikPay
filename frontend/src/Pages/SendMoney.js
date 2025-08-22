import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../Components/Button";
import { Heading } from "../Components/Heading";
import { Input } from "../Components/Input";
import { useState } from "react";
import axios from "axios";
import ReactToastContainer from "../Components/toast";



export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const id = searchParams.get("id");
  const firstname = searchParams.get("firstname")
  const lastname = searchParams.get("lastname")
  const [toast, setToast] = useState({ type: "", message: "" })
  const navigate = useNavigate();
  return (
    <div className="h-screen flex justify-center bg-primary">
      <div className="h-full flex flex-col justify-center">
        <div className=" bg-white h-[400px] w-[400px] p-[60px] flex flex-col items-center text-black border-2 shadow-lg">
          <Heading title={"Tansfer Money"} />
          <div className="flex flex-col items-center space-x-4 my-3">
  
            <div className="flex justify-center text-xl my-3 ">
              Money Recipient:{" "+firstname +" "+ lastname}
            </div>
            <div className="flex justify-cente text-xl">
              <Input placeholder={"Enter Amount To be sent"} type={"number"} onChange={(e) => {
                setAmount(e.target.value)
              }} />
            </div>
            <div className="">
              <Button label={"Send Money"} onClick={async () => {
                const token = localStorage.getItem("token");
                await axios.post("http://localhost:3000/api/v1/account/transferAmount", { amount: amount, to: id }, { headers: { Authorization: "Bearer " + token } }).then(response => {
                  if (response) {
                    setToast({ type: "success", message: "Transaction Successful" })
                    setTimeout(() => {
                       navigate("/dashboard")
                    },3000)   
                }})
              }}/>
            </div>
          </div>
        </div>
      </div>
      <ReactToastContainer type={toast.type} message={toast.message}/>
    </div>
  );
};
