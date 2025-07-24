export function Button({label,onClick}) {
    return (
        <button onClick={onClick} className="w-full p-3 bg-black text-white mt-6 ">{ label }</button>
    )
}