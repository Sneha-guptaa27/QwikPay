import React,{ useEffect } from "react";
import { toast ,ToastContainer} from "react-toastify";
import "react-toastify/ReactToastify.css"

 const ReactToastContainer=({ type = "default", message = ""})=> {
    useEffect(() => {
        if (!message) {
            return 
        }
        switch (type) {
            case "success":
                toast.success(message)
                break;
            case "error":
                toast.error(message)
                break;
            case "warning":
                toast.warning(message)
                break;
            case "info":
                toast.info(message)
                break;
            default:toast(message)
        }
    },[type,message])
    return (
        <>
            <ToastContainer />
        </>
    )
 }
export default ReactToastContainer;