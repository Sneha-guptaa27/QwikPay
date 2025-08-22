import React, { useState } from "react";
import { Button } from "../Components/Button";
import api from "../API/api";
import { Navbar } from "../Components/Navbar";
import { Sidebar } from "../Components/Siderbar";
import { Appbar } from "../Components/Appbar";
import { Heading } from "../Components/Heading";
import { SubHeading } from "../Components/SubHeading";
import { Input } from "../Components/Input";
import ReactToastContainer from "../Components/toast";

const AccountCreation = () => {
  const [open, setOpen] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIFSC] = useState("");
  const [pan, setPAN] = useState("");
  const [toast, setToast] = useState("");
  const [initialBalance, setInitialBalance] = useState();

  return (
    <div className="h-full w-full flex flex-col relative scroll-auto">
          <Appbar />
          <div className='flex ' >
            <Sidebar />
        <div className="flex flex-col ml-[40px] mt-[40px] w-full mr-[40px] items-center">
            <div className="flex mt-[15px] justify-center w-[500px] h-[80px]">
            <Button label={"ADD ACCOUNT"} onClick={()=>setOpen(true)} />
          </div>
         {open && (<div className="w-[500px] h-[730px] bg-primary mt-[20px] flex flex-col items-center">
            <Heading title={"Create Account"} />
            <SubHeading label={"Enter Your Bank Details"} />
            <div className="flex flex-col mt-[30px] w-[400px]">
              <Input label={"Account Holder Name"} placeholder={"Enter the account holder name"} type={""} onChange={(e)=>setHolderName(e.target.value)}/>
              <Input label={"Bank Name"} placeholder={"Enter Your Bank's Name"} onChange={(e)=>setBankName(e.target.value)} />
              <Input label={"Account Number"} placeholder={"Enter Your Account Number"} onChange={(e)=>{setAccountNumber(e.target.value)}} />
              <Input label={"IFSC"} placeholder={"Enter your IFSC number"} onChange={(e)=>setIFSC(e.target.value)}/>
              <Input label={"Permanent Account Number"} placeholder={"Enter your PAN Number"} onChange={(e) => setPAN(e.target.value)} />
              <Input label={"Initial Balance"} placeholder={"Enter your initial bank balance"} onChange={(e)=>{setInitialBalance(e.target.value)}}/>
              <Button label={"Submit Details"} onClick={
                async () => {
                  try {
                    // const token = localStorage.getItem("token");
                    // if (!token) {
                    // const refreshToken = await api.post("/auth/refresh");
                    // localStorage.setItem("refreshToken",refreshToken);
                    // }
                    const response = await api.post("/account/create", { holderName, bankName, accountNumber, ifsc, pan, initialBalance }, { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }).then(
                      setOpen(false)
                    )
                  setToast({type:"success", message:"Account created successfully"})
                  }
                  catch (error) {
                    setToast({ type: "error", message: "Cannot create account" });
                  }
                }
              } />
            </div>
           </div>)} 
          </div>
      </div>
       <ReactToastContainer type={toast.type} message={toast.message}/>
        </div>
  );
};

export default AccountCreation;
