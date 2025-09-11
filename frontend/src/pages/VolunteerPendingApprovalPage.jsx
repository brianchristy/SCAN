import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/signup-bg.jpg";

const VolunteerPendingApprovalPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 7000);
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
          Registration Pending Approval
        </h2>
        <p className="text-center text-indigo-100 mb-6">
          Thank you for signing up as a volunteer!<br />
          Your registration is pending admin approval. You will be notified by email once your account is approved.<br />
          <span className="block mt-4 text-blue-200 font-semibold">Redirecting to login in 7 seconds...</span>
        </p>
      </div>
    </div>
  );
};

export default VolunteerPendingApprovalPage; 