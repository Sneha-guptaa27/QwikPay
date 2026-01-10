import { useNavigate } from "react-router-dom"
import { Button } from "../Components/Button"
import { ClickableText } from "../Components/ClickableText"
import { Heading } from "../Components/Heading"
import { Input } from "../Components/Input"
import { SubHeading } from "../Components/SubHeading"
import axios from "axios"
import { useState } from "react"
import ReactToastContainer from "../Components/toast"
import api from "../API/api"


export const SignIn = () => {
    const navigate = useNavigate();
    const [userName, setUsername] = useState("");
    const [passWord, setPassword] = useState("");
    const [toast, setToast] = useState({ type: "", message: "" })
    return (
        <div className="h-screen w-screen flex justify-center bg-primary">
            <div className="flex flex-col justify-center ">
                <div className=" w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg">
                    <Heading title={"SIGN IN"} />
                    <SubHeading label={"Enter Your Details To Sign In"} />
                    <Input label={"Email"} placeholder={"Enter your registered email"} onChange={(e) => {
                        setUsername(e.target.value)
                    }}/>
                    <Input label={"Password"} placeholder={"Enter your password"} type={"password"} onChange={(e) => {
                        setPassword(e.target.value);
                    }} />
            
                    <Button label={"Sign In"} onClick={
                        async() => {
                            try {
                                const response =await api.post("/user/signIn", { username: userName, password: passWord });
                                localStorage.setItem("token", response.data.token);
                                navigate("/HomePage");
                            }
                            catch (error) {
                                 setToast({ type: "error", message: "Something went wrong" })
                          }
                        }
                    }/>
                    <ClickableText to={"/signUp"} label={"Dont have an Account ?"} buttonText={"Sign Up"} />
              </div>
            </div>
             <ReactToastContainer type={toast.type} message={toast.message}/>
        </div>
    )
}