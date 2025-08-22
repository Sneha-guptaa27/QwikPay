import logo from './logo.svg';
import ReactDom from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { SignUp } from './Pages/SignUp';
import './App.css';
import { SignIn } from './Pages/SignIn';
import { Dashboard } from './Pages/PayMoney';
import { SendMoney } from './Pages/SendMoney';
import { LandingPage } from './Pages/LandingPage';
import { HomePage } from './Pages/HomePage';
import { OtpVerification } from './Pages/OtpVerification';
import { RegisteredUser } from './Pages/RegisteredUser';
import AccountCreation from './Pages/AccountCreation';
import PaymentPage from './Pages/PaymentPage';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/signUp' element={<SignUp/>} />
          <Route path='/signIn' element={<SignIn />} />
          <Route path='/' element={<LandingPage />} />
          <Route path='/HomePage' element={<HomePage/> } />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/send' element={<SendMoney />} /> 
          <Route path="/otpVerify" element={<OtpVerification />} />
          <Route path='/registeredUser' element={<RegisteredUser />} />
          <Route path='/accountCreation' element={<AccountCreation />} />
          <Route path='/payMoney' element={<PaymentPage/>}/>
         </Routes>
     </BrowserRouter>
   </>
  );
}

export default App;
