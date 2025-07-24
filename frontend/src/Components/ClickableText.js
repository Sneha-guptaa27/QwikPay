import { Link } from "react-router-dom";

export function ClickableText({ label, to,buttonText }) {
    return (
        <div className="flex justify-center text-md py-4">
            <div>{label}</div>
            <Link to={to} className="text-blue-500 pointer underline cursor-pointer pl-1">{buttonText}</Link>
        </div>  
    )
}