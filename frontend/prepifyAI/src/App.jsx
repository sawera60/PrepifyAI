import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./features/auth/SignUp";
import Login from "./features/auth/Login";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import InterviewChat from "./pages/interview/InterviewChat";
import CustomInterviewSetup from "./pages/interview/CustomInterviewSetup";
import InterviewAnalysis from "./features/analysis/interviewAnalysis";
import ResumeInterviewSetup from "./pages/resume/ResumeInterviewSetup";
import MyInterviewsPage from "./pages/interview/MyInterviewsPage";
import PaymentPage from "./pages/payment/PaymentPage";
import SettingsPage from "./pages/settings/SettingsPage";


function App() {


  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/custom/setup" element={<CustomInterviewSetup />} />
        <Route path="/interview/:interviewId" element={<InterviewChat />} />
        <Route path="/interview/:sessionId/analysis" element={<InterviewAnalysis />} />
        <Route path="/resume/setup" element={<ResumeInterviewSetup />} />
        <Route path="/my-interviews" element={<MyInterviewsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>

  )
}

export default App
