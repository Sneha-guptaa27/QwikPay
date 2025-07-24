import { useState } from "react"
import { Button } from "../Components/Button"
import { ClickableText } from "../Components/ClickableText"
import { Heading } from "../Components/Heading"
import { Input } from "../Components/Input"
import { SubHeading } from "../Components/SubHeading"
import axios from 'axios'
import { useNavigate } from "react-router-dom"

export const SignUp = () => {
    const [password, setPassword] = useState("");
    const [showpassword, setShowpassword] = useState(false);
    const [firstName, setFirstname] = useState("");
    const [lastName, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    return (

        <div className=" h-screen w-screen flex justify-center bg-amber-200">
            <div className="flex flex-col justify-center ">   
                <div className=" w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg">
                    <Heading title={"SIGN UP"} /> 
                    <SubHeading label={"Enter Your Information To Create An Account"} />
                    <Input label={"First Name"} placeholder={"Enter your first name"} onChange={e=>{setFirstname(e.target.value)}}/>
                    <Input label={"Last Name"} placeholder={"Enter your last name"} onChange={e=>{setLastname(e.target.value)}}/>
                    <Input label={"Email"} placeholder={"Enter your email address"} onChange={e=>{setUsername(e.target.value)}}/>
                    <Input label={"Password"} placeholder={"Enter your password"} type={showpassword ? "text" : "password"} onChange={e => { setPassword(e.target.value) }} />
                    
                    <Button label={"Sign Up"} onClick={async () => {
                        try {
                            const response = await axios.post("http://localhost:3000/api/v1/user/signUp", { firstName, lastName, username, password });
                            console.log("Signup success", response.data);
                            localStorage.setItem("token", response.data.token);
                            navigate("/dashboard")
                        }
                        
                        catch (error) {
                            console.log("Signup failed", error.response?.data || error.message)
                        }
                    }} />

                    <ClickableText to={"/signIn"} label={"Already have an account?"} buttonText={"Sign In"} />
                </div>
            </div>
        </div>
        
    )
}
