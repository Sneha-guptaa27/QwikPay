import { useNavigate } from "react-router-dom";
import Logo from "../Assets/Images/logo.png";


export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full w-full">
      <div className=" w-full flex  justify-between">
        <div className="h-full flex flex-col justify-center ml-4 text-3xl font-bold text-orange-950">
          <img className="h-20 w-25 ml-4 mt-8" src={Logo}></img>
        </div>
        <div className="flex alig ">
          <div>
            <button
              className="w-[150px] h-[50px] m-[40px] rounded-[21px] bg-third font-bold text-white"
              onClick={() => { navigate("/signUp") }}>
              LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
