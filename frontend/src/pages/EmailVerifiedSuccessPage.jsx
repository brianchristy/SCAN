import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/signup-bg.jpg";

const EmailVerifiedSuccessPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);
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
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Email Verified!
        </h2>
        <p className="text-center text-green-200 mb-6">
          You have successfully verified your email.<br />
          Redirecting to the login page in 5 seconds...
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 mt-2"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
};
export default EmailVerifiedSuccessPage; 