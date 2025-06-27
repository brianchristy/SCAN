import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import bgImage from "../assets/signup-bg.jpg";

const EmailVerificationPage = () => {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    // Auto-verify
    fetch(`/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully. You can now log in.");
          if (data.pendingApproval) {
            setTimeout(() => navigate("/volunteer-pending-approval"), 4000);
          } else {
            setTimeout(() => navigate("/login"), 4000);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      });
  }, [location.search, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-fixed bg-cover bg-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.7), rgba(30, 58, 138, 0.7)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Email Verification
        </h2>
        {status === "verifying" && (
          <p className="text-center text-indigo-100 mb-6">Verifying your email, please wait...</p>
        )}
        {status !== "verifying" && (
          <p
            className={`text-center mb-6 font-semibold ${
              status === "success" ? "text-green-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
};
export default EmailVerificationPage;
