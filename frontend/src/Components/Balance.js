export const Balance = ({value}) => {
    return (
        <div className="flex mt-3">
            <div className="font-bold text-xl ">
                Your Balance is :
            </div>
            <div className="font-semibold text-xl ml-2">
                {value}
            </div>
        </div>
    )
}