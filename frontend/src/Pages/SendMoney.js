import { useSearchParams } from "react-router-dom";
import { Button } from "../Components/Button";
import { Heading } from "../Components/Heading";
import { Input } from "../Components/Input";
import { useState } from "react";
import axios from "axios";


export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const id = searchParams.get("id");
  const firstname = searchParams.get("firstname")
  const lastname=searchParams.get("lastname")
  return (
    <div className="h-screen flex justify-center bg-amber-200">
      <div className="h-full flex flex-col justify-center">
        <div className=" bg-white h-min p-5 flex flex-col items-center ">
          <Heading title={"Tansfer Money"} />
          <div className="flex flex-col items-center space-x-4 my-3">
  
            <div className="flex justify-center text-xl my-3 ">
              Money Recipient:{" "+firstname +" "+ lastname}
            </div>
            <div className="flex justify-center text-xl  items-center my-3">
              Transaction Reference ID:
              <div className="ml-2 mr-2">
              {Math.random()*100000000}
               </div>
            </div>
            <div className="flex justify-cente text-xl">
              <Input placeholder={"Enter Amount To be sent"} type={Number} onChange={(e) => {
                setAmount(e.target.value)
              }} />
            </div>
            <div className="">
              <Button label={"Send Money"} onClick={() => {
                axios.post("http://localhost:3000/api/v1/account/transferAmount",{amount,to:id},{headers:{Authorization:"Bearer "+localStorage.getItem("token")}})
              }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
