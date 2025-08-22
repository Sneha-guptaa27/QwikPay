export function Input({label,placeholder,type,onChange}) {
    return (
        <div className="">
            <div className="py-2 font-medium text-left ">{label}</div>
            <input placeholder={placeholder} type={type} onChange={onChange} className="w-full p-2 border border-slate-300 rounded text-black font-semibold"/>
        </div>  
    )
}