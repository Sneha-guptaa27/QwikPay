import Logo from "../Assets/Images/logo.png"
export const Appbar = () => {
    return (
        <div className="h-[80px] flex justify-between shadow-md bg-primary items-center ">
            <div className="h-full flex flex-col justify ml-4 items-center pl-[20px] pt-[10px]">
          <img className="h-[60px] w-25 ml-4 " src={Logo}></img>
        </div>
            <div className="flex ">
            </div>
        </div>
    )
}