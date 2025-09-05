import { useState } from "react"
import api from "../API/api";
import { Heading } from './Heading';
import { Input } from './Input';
import { Button } from './Button';
import ReactToastContainer from './toast';
import Dropdown from "./Dropdown";
import { useNavigate } from "react-router-dom";


export function ExternalPayment() {
    const [method, setmethod] = useState("UPI");
    const [payee, setPayee] = useState("");
    const [amountPaise, setAmountPaise] = useState(0);
    const [note, setNote] = useState(""); 
    const [senderId, setSenderId] = useState();
    const [toast, setToast] = useState({ type: "", message: "" })
const navigate = useNavigate();
    const handleTransfer=async(e)=> {
        e.preventDefault();
        try {
            const user = localStorage.getItem("token");
            const res = await api.get("/account/getaccount", user);
            console.log(res);
            setSenderId(res.data[0]._id);
            const response = await api.post("/payment/externalPayment", { amountPaise: parseInt(amountPaise), note: note, fromAccountId:senderId,payee:payee, method:method}, { headers: { "idempotency-key": Date.now().toString() } });
            if (response.data.duplicate) {
                setToast({
                    type: "error",
                    message: `Duplicate Request. Transaction Id:${response.data.txId}`
                })
            }
            else {
                setToast({
                    type: "success",
                    message: `Transaction Successful. Transaction Id:${response.data.txId} ref:${response.data.providerRef}`
                    
                })
                  setTimeout(() => {
                    navigate("/HomePage");
                  }, 3000);
            }
        }
        catch (err) {
             setToast({
              type: "error",
              message:"Transaction Failed",
            });
        }
     }
    return (
       <div className="h-screen w-screen flex justify-center bg-primary">
               <div className="flex flex-col justify-center ">   
              <div className=" w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg">
                  <Heading title={"TRANSFER MONEY EXTERNALLY"} />
                    <div className='mt-[20px]'>
                  
                  <Input label={"Receiver's Name"} placeholder={"Enter Name Of Receiver"} onChange={(e)=>setPayee(e.target.value)} />
                      <Input label={"Amount"} placeholder={"Enter Amount to be tranferred"} onChange={(e) => setAmountPaise(e.target.value)} />
                        <Input label={"Note"} placeholder={"Enter message for receiver"} onChange={(e) => setNote(e.target.value)} />
                        <Dropdown label={"Payment Method"} placeholder={"Select Method"} onChange={setmethod} options={[{ label:"upi",value:"upi"},{ label:"card",value:"card"},{ label:"netbanking",value:"netbanking"},{ label:"wallet",value:"wallet"},{ label:"mock",value:"mock"}]} value={method}/>
                  <Button label={"Send Money"} onClick={handleTransfer}/>
                  </div>
                </div>
          </div>
          <ReactToastContainer type={toast.type} message={toast.message}/>
    </div>
  )  
}