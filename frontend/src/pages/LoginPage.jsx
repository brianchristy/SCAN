import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Eye, EyeOff, AlertCircle, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast, { Toaster } from "react-hot-toast";
import backgroundImage from "../assets/signup-bg.jpg";

// Animation variants
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

// Custom Input Component
const Input = ({ icon: Icon, type = 'text', label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
          error
            ? 'border-red-500 bg-red-50/10'
            : isFocused
            ? 'border-blue-400 bg-white/10'
            : 'border-gray-200/20 bg-white/5 hover:border-blue-300/50'
        }`}
      >
        {Icon && (
          <Icon
            className={`h-5 w-5 ${
              error ? 'text-red-400' : 'text-blue-300'
            }`}
          />
        )}
        <input
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          className={`w-full ml-3 bg-transparent outline-none text-white placeholder-gray-300 ${
            error ? 'placeholder-red-300' : 'placeholder-gray-300'
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-300 hover:text-blue-300 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
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
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const { login, isLoading, error, isAuthenticated } = useAuthStore();

  // Main container styles
  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  };
  
  // Form container styles
  const formContainerStyle = {
    width: '100%',
    maxWidth: '28rem',
    margin: '0 auto',
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.category === 'Volunteer') {
        navigate('/volunteer-home');
      } else if (user.category === 'Citizen' || user.category === 'Senior Citizen') {
        navigate('/citizen-home');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await login(formData.email, formData.password);
      if (result?.success) {
        toast.success('Login successful!');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleHomeClick = async () => {
    await checkAuth();
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
      
      {/* Main Container */}
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
          {/* Header */}
          <div className="p-8 text-center">
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-blue-200">Sign in to your SCAN account</p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on" method="post">
              <motion.div variants={itemVariants}>
                <Input
                  icon={Mail}
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="username"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  icon={Lock}
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                />
              </motion.div>

              <motion.div 
                className="flex items-center justify-end"
                variants={itemVariants}
              >
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-200 hover:text-blue-400 transition-colors"
                >
                  Forgot password?
                </Link>
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
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-6 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-300 text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-blue-300 font-medium hover:text-white transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
