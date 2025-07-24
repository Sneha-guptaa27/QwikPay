import { Button } from "../Components/Button"
import { ClickableText } from "../Components/ClickableText"
import { Heading } from "../Components/Heading"
import { Input } from "../Components/Input"
import { SubHeading } from "../Components/SubHeading"

export const SignIn = () => {
    return (
        <div className="h-screen w-screen flex justify-center bg-amber-200">
            <div className="flex flex-col justify-center ">
                <div className=" w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg">
                    <Heading title={"SIGN IN"} />
                    <SubHeading label={"Enter Your Details To Sign In"} />
                    <Input label={"Email"} placeholder={"Enter your registered email"} />
                    <Input label={"Password"} placeholder={"Enter your password"} type={"password"} />
                    <Button label={"Sign In"} />
                    <ClickableText to={"/signUp"} label={"Dont have an Account ?"} buttonText={"Sign Up"} />
              </div>
            </div>
        </div>
    )
}