import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams, Link } from "react-router-dom";
import Input from "../components/Input";
import { Lock, Home } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import backgroundImage from "../assets/signup-bg.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState("");

  // Remove any logic or display for 'No token provided'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully, redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setLocalError(error.message || "Error resetting password");
      toast.error(error.message || "Error resetting password");
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fixed bg-cover bg-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Toaster position="top-center" />
      {/* Home Button */}
      <motion.div 
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleHomeClick}
          className="flex items-center group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:border-blue-400/50 transition-colors duration-200">
            <Home className="h-5 w-5 text-white group-hover:text-blue-300 transition-colors duration-200" />
          </div>
          <span className="ml-3 text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Back to Home
          </span>
        </button>
      </motion.div>
      <motion.div 
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          variants={itemVariants}
        >
          <div className="p-8 text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6 text-white">Reset Password</h2>
            </motion.div>
          </div>
          <div className="px-8 pb-8">
            {/* Only show backend error message if it is not a generic status code error */}
            {localError && localError !== 'No token provided' && !localError.toLowerCase().includes('status code') && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mb-4 text-center"
              >
                {localError}
              </motion.p>
            )}
            {error && error !== 'No token provided' && !error.toLowerCase().includes('status code') && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mb-4 text-center"
              >
                {error}
              </motion.p>
            )}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm mb-4 text-center"
              >
                {message}
              </motion.p>
            )}
            <form onSubmit={handleSubmit} autoComplete="on" method="post" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-lg transition-all duration-200 ${
                    isLoading 
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Set New Password"}
                </motion.button>
              </motion.div>
            </form>
            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <Link to="/login" className="text-blue-300 font-medium hover:text-white transition-colors">
                Back to Login
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
