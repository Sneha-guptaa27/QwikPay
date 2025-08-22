import { Link } from "react-router-dom";

export function ClickableLinks({ label, to,buttonText }) {
    return (
        <div className="flex justify-center text-md py-4">
            <div>{label}</div>
            <Link to={to} className="text-white pointer cursor-pointer pl-1">{buttonText}</Link>
        </div>  
    )
}