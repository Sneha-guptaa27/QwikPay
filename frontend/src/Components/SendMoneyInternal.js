
import React, { use, useEffect, useState } from 'react'
import api from '../API/api';
import { Heading } from './Heading';
import { Input } from './Input';
import { Button } from './Button';
import ReactToastContainer from './toast';
import { useNavigate } from 'react-router-dom';


export function SendMoney() {
    const [recepient, setRecipient] = useState("")
    const [amount, setAmount] = useState(0);
    const [note, setNote] = useState("");
    const [senderId, setSenderId] = useState("");
    const [toast, setToast] = useState({ type: "", message: "" })
    const navigate = useNavigate();

    useEffect(() => {
        getSenderID();
    }, []);
    const getSenderID = async () => {
        const user = localStorage.getItem("token");
        const res = await api.get("/account/getaccount", user);
        setSenderId(res.data[0]._id);
        console.log("SenderId:", senderId);
    }

    const handleSend = async (e) => {
        e.preventDefault();
        try {   
                const response = await api.post("/payment/transfer", { toUpiId: recepient, amountPaise: parseInt(amount), note: note, fromAccountId: senderId }, { headers: { "idempotency-key": Date.now().toString() } });
                if (response.data.duplicate) {
                    setToast({
                        type: "error",
                        message: `Duplicate Request. Transaction Id:${response.data.txId}`
                    })
                }
                else {
                    setToast({
                        type: "success",
                        message: "Transaction Successful"
                    })
                    setTimeout(() => {
                        navigate("/HomePage");
                    }, 3000);
                }
        }
        catch (err) {
            setToast({
                type: "error",
                message: "Transaction Failed",
            });
        }
    }

    return (
        <div className="flex justify-center bg-primary">
            <div className="flex flex-col justify-center ">
                <div className=" w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg">
                    <Heading title={"TRANSFER MONEY"} />
                    <div className='mt-[20px]'>
                        <Input label={"Receiver's UPI Id"} placeholder={"Enter UPI Id of Receiver"} onChange={(e) => setRecipient(e.target.value)} />
                        <Input label={"Amount"} placeholder={"Enter Amount to be tranferred"} onChange={(e) => setAmount(e.target.value)} />
                        <Input label={"Note"} placeholder={"Enter message for receiver"} onChange={(e) => setNote(e.target.value)} />
                        <Button label={"Send Money"} onClick={handleSend} />
                    </div>
                </div>
            </div>
            <ReactToastContainer type={toast.type} message={toast.message} />
        </div>
    )
}
