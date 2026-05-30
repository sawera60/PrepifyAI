import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./features/auth/SignUp";
import Login from "./features/auth/Login";
function App() {


  return (
    <>
      <SignUp />
      <ToastContainer />
      <Login />
    </>
  )
}

export default App
