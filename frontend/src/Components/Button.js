export function Button({label,onClick}) {
    return (
        <button onClick={onClick} className="w-full p-3 bg-secondary text-white mt-6 ">{ label }</button>
    )
}