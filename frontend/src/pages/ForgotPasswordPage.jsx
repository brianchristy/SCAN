import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader, AlertCircle, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Email is required");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong");
        toast.error(data.message || "Something went wrong");
      } else {
        setSuccess(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
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
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-blue-200">Enter your registered email to receive a password reset link.</p>
            </motion.div>
          </div>
          <div className="px-8 pb-8">
            {success ? (
              <div className="text-green-300 text-center py-6">
                <p>Password reset email sent! Check your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on" method="post">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-200 mb-1.5">Email Address</label>
                  <div className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${error ? 'border-red-500 bg-red-50/10' : 'border-gray-200/20 bg-white/5 hover:border-blue-300/50'}`}>
                    <Mail className={`h-5 w-5 ${error ? 'text-red-400' : 'text-blue-300'}`} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your registered email"
                      className="w-full ml-3 bg-transparent outline-none text-white placeholder-gray-300"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400 flex items-center"
                    >
                      <AlertCircle size={14} className="mr-1" /> {error}
                    </motion.p>
                  )}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-lg transition-all duration-200 ${
                      isLoading 
                        ? 'bg-blue-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </motion.button>
                </motion.div>
              </form>
            )}
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

export default ForgotPasswordPage; 