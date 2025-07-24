import logo from './logo.svg';
import ReactDom from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { SignUp } from './Pages/SignUp';
import './App.css';
import { SignIn } from './Pages/SignIn';
import { Dashboard } from './Pages/Dashboard';
import { SendMoney } from './Pages/SendMoney';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/signUp' element={<SignUp/>} />
          <Route path='/signIn' element={<SignIn/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/send' element={<SendMoney/>} />           
         </Routes>
     </BrowserRouter>
   </>
  );
}

export default App;
