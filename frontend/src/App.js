import logo from './logo.svg';
import ReactDom from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { SignUp } from './Pages/SignUp';
import './App.css';
import { SignIn } from './Pages/SignIn';
import { Dashboard } from './Pages/PayMoney';
import { LandingPage } from './Pages/LandingPage';
import { HomePage } from './Pages/HomePage';
import { OtpVerification } from './Pages/OtpVerification';
import { RegisteredUser } from "./Pages/RegisteredUser";
import AccountCreation from './Pages/AccountCreation';
import PaymentPage from './Pages/PaymentPage';
import ExternalPayment from './Pages/ExternalPaymentPage.js';
import PaymentHistory from './Pages/PaymentHistory.js';
import Expenses from './Pages/Expense.js';
import QwikSplitPage from './Pages/QwikSplitPage.js';



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
          <Route path="/otpVerify" element={<OtpVerification />} />
          <Route path='/registeredUser' element={<RegisteredUser />} />
          <Route path='/accountCreation' element={<AccountCreation />} />
          <Route path='/payMoney' element={<PaymentPage />} />
          <Route path='/payMoneyExternally' element={<ExternalPayment />} />
          <Route path="/paymentHistory" element={<PaymentHistory />} />
          <Route path="/expense" element={<Expenses />} />
          <Route path='/split' element={<QwikSplitPage/>}/>
         </Routes>
     </BrowserRouter>
   </>
  );
}

export default App;
