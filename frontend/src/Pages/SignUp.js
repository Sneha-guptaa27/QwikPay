import { useState } from "react"
import { Button } from "../Components/Button"
import { ClickableText } from "../Components/ClickableText"
import { Heading } from "../Components/Heading"
import { Input } from "../Components/Input"
import { SubHeading } from "../Components/SubHeading"
import { useNavigate } from "react-router-dom"
import ReactToastContainer from "../Components/toast"
import api from "../API/api"

export const SignUp = () => {
    const [firstName, setFirstname] = useState("");
    const [lastName, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const navigate = useNavigate();
    const [toast, setToast] = useState({ type: "", message: "" })
    return (

        <div className=" h-screen w-screen flex justify-center bg-primary">
            <div className="flex flex-col justify-center ">   
                <div className=" w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg">
                    <Heading title={"SIGN UP"} /> 
                    <SubHeading label={"Enter Your Information To Create An Account"} />
                    <Input label={"First Name"} placeholder={"Enter your first name"} onChange={e=>{setFirstname(e.target.value)}}/>
                    <Input label={"Last Name"} placeholder={"Enter your last name"} onChange={e=>{setLastname(e.target.value)}}/>
                    <Input label={"Email"} placeholder={"Enter your email address"} onChange={e=>{setEmail(e.target.value)}}/>
                    <Input label={"Phone Number"} placeholder={"Enter your Phone Number"} onChange={e => { setPhoneNumber(e.target.value) }}/>
                    
                    <Button label={"SIGN UP"} onClick={
                        async () => {
                            try {
                                const target = email;
                                const context = "signup";
                                const channel = "email";
                                const userData = {
                                    firstName: firstName,
                                    lastName: lastName,
                                    phoneNumber: phoneNumber,
                                }
                                // 1) ask backend to send OTP
                                await api.post(
                                    "/auth/otp/request",
                                    { target: target, channel: channel, context: context } // email
                                )
                                navigate("/otpVerify?&userData=" + encodeURIComponent(JSON.stringify(userData)) + "&email=" + email + "&context=" + context);
                                     
                            }
                            catch (err) {
                                const backendMsg =
                                    err?.response?.data?.error ||
                                    err?.response?.data?.message ||
                                    err?.message;

                                setToast({
                                    type: "error",
                                    message: backendMsg || "Failed to send OTP",
                                });
                            
                            }  
                        }
                    } />
            <ClickableText label={"ALready a User?"} buttonText={"Sign In with email"} to={"/registeredUser"} />
                </div>
            </div>
            <ReactToastContainer type={toast.type} message={toast.message}/>
        </div>  
    )
}
