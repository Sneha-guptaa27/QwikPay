import { useState } from "react";
import { Input } from "../Components/Input";
import { Heading } from "../Components/Heading";
import { SubHeading } from "../Components/SubHeading";
import { Button } from "../Components/Button";
import { useNavigate } from "react-router-dom";
import ReactToastContainer from "../Components/toast";
import axios from "axios";
import Axios from "../API/api";
import api from "../API/api";

export const RegisteredUser = () => {
  const [otp, setOTP] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [toast, setToast] = useState({ type: "", message: "" });
  const [otpSent, setotpSent] = useState(false);
  return (
    <div className="h-screen w-screen flex justify-center bg-primary">
      <div className="flex flex-col justify-center">
        <div className="w-[500px] h-max rounded-lg text-center p-8 bg-white shadow-lg ">
          <Heading title={"OTP VERIFICATION"} />
          <SubHeading
            label={"An OTP will be sent to your email"}
          />
          <Input
            label={"Email"}
            placeholder={"Enter your email address"}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
         { !otpSent && <Button
            label={"Send OTP"}
            onClick={async () => {
              try {
                const target = email;
                const context = "login";
                const channel = "email";
                // 1) ask backend to send OTP
                await api.post(
                  "/auth/otp/request",
                  { target: target, channel: channel, context: context } // email
                );
                setotpSent(true);
              } catch (error) {
                setToast({ type: "error", message: "Failed to send otp" });
              }
            }}
          />}
          {otpSent && (
            <Input
              label={"OTP"}
              placeholder={"Enter OTP sent on your registered email"}
              onChange={(e) => {
                setOTP(e.target.value);
              }}
            />
          )}
          {otpSent && (
            <Button
              label={"Verify OTP"}
              onClick={async () => {
                  try {
                const context = "login";
                  const verify = await api.post(
                    "/auth/otp/verify",
                    {
                      target: email,
                      code: otp,
                      context: context,
                    }
                  );
                      localStorage.setItem("token",verify.data.access);
                      navigate("/HomePage");
                     
                  }
                  catch (err) {
                  console.error(err);
                  setToast({ type: "error", message: "Server error" });
                }
              }}
            />
          )}
        </div>
      </div>
      <ReactToastContainer type={toast.type} message={toast.message} />
    </div>
  );
};
