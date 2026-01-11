import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../Components/Button";
import { Heading } from "../Components/Heading";
import { Input } from "../Components/Input";
import { SubHeading } from "../Components/SubHeading";
import { useState } from "react";
import ReactToastContainer from "../Components/toast";
import api from "../API/api";

export const OtpVerification = () => {
  const [searchParams] = useSearchParams();
  const userData = JSON.parse(searchParams.get("userData"));
  const email = searchParams.get("email");
  const context = searchParams.get("context");
  const [otp, setOTP] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex justify-center bg-primary">
      <div className="flex flex-col justify-center">
        <div className="w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg ">
          <Heading title={"OTP VERIFICATION"} />
          <SubHeading
            label={
              "An OTP will has been sent to your registered email, please enter"
            }
          />
          <div className="flex flex-col mt-3">
            <div className=" flex font-medium justify-start">EMAIL:</div>
            <input
              type="text"
              value={email}
              disabled
              className="w-full p-2 border border-slate-300 rounded mt-2"
            />
          </div>
          <Input
            label={"OTP"}
            placeholder={"Enter OTP sent on your registered email"}
            onChange={(e) => {
              setOTP(e.target.value);
            }}
          />
          <Button
            label={"Verify OTP"}
            onClick={async () => {
              try {
                const verify = await api.post(
                  "auth/otp/verify",
                  {userData:userData ,target:email,code:otp,context:context }
                );
                localStorage.setItem("token", verify.data.access);
                navigate("/HomePage");
              } catch (err) {
                console.error(err);
                setToast({ type: "error", message: "Server error" });
              }
            }}
          />
        </div>
      </div>
      <ReactToastContainer type={toast.type} message={toast.message} />
    </div>
  );
};
