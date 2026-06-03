import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./features/auth/SignUp";
import Login from "./features/auth/Login";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import InterviewChat from "./features/interview/InterviewChat";
function App() {


  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/:interviewId" element={<InterviewChat />} />
      </Routes>
    </>

  )
}

export default App
