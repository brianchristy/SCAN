import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Loader, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Check, 
  X,
  Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import backgroundImage from '../assets/signup-bg.jpg';

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
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
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
          onCopy={type === 'password' && !showPassword ? (e) => e.preventDefault() : undefined}
          onCut={type === 'password' && !showPassword ? (e) => e.preventDefault() : undefined}
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

const PasswordConstraints = ({ password, isVisible }) => {
  if (!isVisible) return null;
  
  const constraints = [
    {
      text: 'At least 8 characters',
      validate: (pwd) => pwd?.length >= 8
    },
    {
      text: 'At least one uppercase letter (A-Z)',
      validate: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      text: 'At least one lowercase letter (a-z)',
      validate: (pwd) => /[a-z]/.test(pwd)
    },
    {
      text: 'At least one number (0-9)',
      validate: (pwd) => /\d/.test(pwd)
    },
    {
      text: 'At least one special character (!@#$%^&*)',
      validate: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  return (
    <div className="mt-2 space-y-1 text-sm">
      <p className="text-gray-300 font-medium mb-1">Password must contain:</p>
      <ul className="space-y-1">
        {constraints.map((constraint, index) => {
          const isValid = password ? constraint.validate(password) : false;
          return (
            <li key={index} className="flex items-center">
              <span className={`inline-flex items-center justify-center w-4 h-4 mr-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}>
                {isValid ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <X className="w-3 h-3 text-white" />
                )}
              </span>
              <span className={isValid ? 'text-green-400' : 'text-red-400'}>
                {constraint.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Select = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option',
  label,
  error,
  className = '',
  containerClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.value === value);
      setSelectedLabel(selectedOption ? selectedOption.label : '');
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);
  
  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
      )}
      <div 
        className={`relative ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div 
          className={`flex items-center justify-between w-full p-3 border rounded-lg cursor-pointer ${
            isOpen 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : error 
                ? 'border-red-500' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <span className={`${selectedLabel ? 'text-gray-800' : 'text-gray-400'}`}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center ${
                    value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                  {value === option.value && <Check className="w-4 h-4 ml-auto text-blue-500" />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <X size={14} className="mr-1" /> {error}
        </p>
      )}
    </div>
  );
};

const Checkbox = ({ 
  label, 
  checked, 
  onChange, 
  className = '',
  containerClassName = ''
}) => (
  <div className={`flex items-center ${containerClassName}`}>
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
      />
    </div>
    {label && (
      <label 
        className="ml-2 block text-sm text-gray-700 cursor-pointer"
        onClick={() => onChange(!checked)}
      >
        {label}
      </label>
    )}
  </div>
);

const ConfirmPasswordCheck = ({ password, confirmPassword }) => {
  if (!confirmPassword) return null;
  const isMatch = password === confirmPassword;
  return (
    <div className="mt-2 text-sm flex items-center">
      <span className={`inline-flex items-center justify-center w-4 h-4 mr-2 rounded-full ${isMatch ? 'bg-green-500' : 'bg-red-500'}`}>
        {isMatch ? (
          <Check className="w-3 h-3 text-white" />
        ) : (
          <X className="w-3 h-3 text-white" />
        )}
      </span>
      <span className={isMatch ? 'text-green-400' : 'text-red-400'}>
        {isMatch ? 'Passwords match' : 'Passwords do not match'}
      </span>
    </div>
  );
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactno: '',
    category: '',
    skills: [],
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, error: authError, isLoading, isAuthenticated, checkAuth, user, clearError } = useAuthStore();

  useEffect(() => {
    // Clear any leftover auth errors from other pages
    if (authError) {
      clearError();
    }
  }, []);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const password = formData.password;
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (password.length < minLength) {
        newErrors.password = `Password must be at least ${minLength} characters long`;
      } else if (!hasUpperCase) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!hasLowerCase) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!hasNumbers) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!hasSpecialChar) {
        newErrors.password = 'Password must contain at least one special character';
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Contact number validation
    if (!formData.contactno) {
      newErrors.contactno = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactno)) {
      newErrors.contactno = 'Please enter a valid 10-digit phone number';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    // Location validation for volunteers
    if (formData.category === 'Volunteer' && !formData.location) {
      newErrors.location = 'Please select your location';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const skillsToSubmit = formData.category === "Volunteer" ? formData.skills : null;
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.contactno,
        formData.category,
        skillsToSubmit,
        formData.location
      );
      if (formData.category === 'Volunteer') {
        navigate('/signup-success', { state: { volunteer: true } });
      } else {
        navigate('/signup-success');
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
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
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-blue-200">Join our community today</p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on" method="post">
              <motion.div variants={itemVariants}>
                <Input
                  icon={User}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.name}
                  autoComplete="name"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  icon={Mail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  label="Email Address"
                  placeholder="Enter your email"
                  error={errors.email}
                  autoComplete="email"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  icon={Lock}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password}
                  autoComplete="new-password"
                  required
                />
                <PasswordConstraints 
                  password={formData.password} 
                  isVisible={formData.password.length > 0}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  icon={Lock}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
                <ConfirmPasswordCheck password={formData.password} confirmPassword={formData.confirmPassword} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  icon={Phone}
                  type="tel"
                  name="contactno"
                  value={formData.contactno}
                  onChange={handleChange}
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  error={errors.contactno}
                  autoComplete="tel"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData(prev => ({
                        ...prev,
                        skills: [],
                        location: ""
                      }));
                    }}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200/20 bg-white/5 text-white hover:bg-white/10 focus:bg-white/10 focus:border-blue-400 focus:ring-0 focus:ring-blue-400/20 focus:ring-offset-0 transition-all duration-200"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none',
                      cursor: 'pointer',
                      color: '#ffffff'
                    }}
                    required
                  >
                    <option value="" hidden disabled className="bg-gray-800 text-white">Select your role</option>
                    <option value="Volunteer" className="bg-gray-800 text-white hover:bg-gray-700">Volunteer</option>
                    <option value="Citizen" className="bg-gray-800 text-white hover:bg-gray-700">Citizen</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
                {errors.category && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle size={14} className="mr-1" /> {errors.category}
                  </motion.p>
                )}
              </motion.div>

              {formData.category === "Volunteer" && (
                <>
                  <motion.div variants={itemVariants} className="mt-2">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Skills</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Driving', 'Cooking', 'Housekeeping', 'Gardening', 'Companionship', 'Reading', 'Shopping', 'Medical Assistance'].map(skill => (
                        <label key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillChange(skill)}
                            className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-200">{skill}</span>
                        </label>
                      ))}
                    </div>
                    {errors.skills && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1 flex items-center"
                      >
                        <AlertCircle size={14} className="mr-1" /> {errors.skills}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative mt-4">
                    <label className="block text-sm font-medium text-gray-200 mb-1.5">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-indigo-400" />
                      </div>
                      <select
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200/20 bg-white/5 text-white hover:bg-white/10 focus:bg-white/10 focus:border-blue-400 focus:ring-0 focus:ring-blue-400/20 focus:ring-offset-0 transition-all duration-200"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          backgroundImage: 'none',
                          cursor: 'pointer',
                          color: '#ffffff'
                        }}
                        required
                      >
                        <option value="" className="bg-gray-800 text-white hover:bg-gray-700">Select your location</option>
                        <option value="Thiruvananthapuram" className="bg-gray-800 text-white hover:bg-gray-700">Thiruvananthapuram</option>
                        <option value="Kollam" className="bg-gray-800 text-white hover:bg-gray-700">Kollam</option>
                        <option value="Alappuzha" className="bg-gray-800 text-white hover:bg-gray-700">Alappuzha</option>
                        <option value="Pathanamthitta" className="bg-gray-800 text-white hover:bg-gray-700">Pathanamthitta</option>
                        <option value="Kottayam" className="bg-gray-800 text-white hover:bg-gray-700">Kottayam</option>
                        <option value="Idukki" className="bg-gray-800 text-white hover:bg-gray-700">Idukki</option>
                        <option value="Ernakulam" className="bg-gray-800 text-white hover:bg-gray-700">Ernakulam</option>
                        <option value="Thrissur" className="bg-gray-800 text-white hover:bg-gray-700">Thrissur</option>
                        <option value="Palakkad" className="bg-gray-800 text-white hover:bg-gray-700">Palakkad</option>
                        <option value="Malappuram" className="bg-gray-800 text-white hover:bg-gray-700">Malappuram</option>
                        <option value="Kozhikode" className="bg-gray-800 text-white hover:bg-gray-700">Kozhikode</option>
                        <option value="Wayanad" className="bg-gray-800 text-white hover:bg-gray-700">Wayanad</option>
                        <option value="Kannur" className="bg-gray-800 text-white hover:bg-gray-700">Kannur</option>
                        <option value="Kasaragod" className="bg-gray-800 text-white hover:bg-gray-700">Kasaragod</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-indigo-400" />
                      </div>
                    </div>
                    {errors.location && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1 flex items-center"
                      >
                        <AlertCircle size={14} className="mr-1" /> {errors.location}
                      </motion.p>
                    )}
                  </motion.div>
                </>
              )}

              {authError && authError !== 'No token provided' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-start"
                >
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-lg transition-all duration-200 mt-2 ${
                    isLoading || isSubmitting
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {isLoading || isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </motion.button>
              </motion.div>

              <motion.div 
                className="mt-6 text-center"
                variants={itemVariants}
              >
                <p className="text-gray-300 text-sm">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-300 font-medium hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>

              <motion.div 
                className="mt-4 text-center"
                variants={itemVariants}
              >
                <p className="text-gray-400 text-xs">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-blue-300 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-300 hover:underline">Privacy Policy</a>
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
