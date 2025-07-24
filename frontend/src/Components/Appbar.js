export const Appbar=()=>{
    return (
        <div className="h-20 flex justify-between shadow-md bg-amber-200 ">
            <div className="h-full flex flex-col justify-center ml-4 text-3xl font-bold text-orange-950">
               Qwikpay
            </div>
            <div className="flex ">
                <div className="h-full flex flex-col justify-center text-2xl mr-2 italic">Hello!</div>
                <div className="h-[40px] w-[40px] border-2 border-black bg-white rounded-full flex justify-center mr-4 mt-5">
                    <div className="flex flex-col justify-center text-2xl h-full">U</div>
                </div>
            </div>
        </div>
    )
}