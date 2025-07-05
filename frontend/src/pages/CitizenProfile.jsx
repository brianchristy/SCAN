import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Home, 
  Phone, 
  Check, 
  Loader2,
  ChevronDown,
  HeartPulse,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import seniorBackground from '../assets/volunteerdashboard.jpeg';

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

const CitizenProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, signout, isAuthenticated, checkAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [contactNo, setContactNo] = useState(user?.contactno || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user is a test account
  const isTestAccount = user?.email === 'citizen@gmail.com' || user?.email === 'volunteer@gmail.com';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Prevent updates for test accounts
    if (isTestAccount) {
      toast.error('Test accounts cannot update their profile information');
      return;
    }
    
    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (contactNo && !phoneRegex.test(contactNo)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateProfile({ 
        name, 
        contactno: contactNo, // Match backend field name
        location: user?.location || '' // Include location if it exists
      });
      toast.success('Profile updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/citizen-home');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signout();
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleHomeClick = async () => {
    await checkAuth();
    navigate("/citizen-home");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with overlay */}
        <div 
        className="fixed inset-0 z-0"
          style={{
          backgroundImage: `url(${seniorBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-indigo-900/80 backdrop-blur-sm" />
        </div>
      {/* End background */}
      
      {/* Navbar */}
      <header className="w-full p-4 fixed top-0 left-0 z-50 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/citizen-home"
            className="flex items-center space-x-2 group"
          >
            <HeartPulse className="h-8 w-8 text-blue-300 group-hover:text-blue-200 transition-colors" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              SCAN
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Home size={20} />
              Home
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-red-500/20"
            >
              <LogOut size={18} className="mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <motion.main 
        className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-28 pb-16 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="w-full max-w-3xl bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden relative"
          variants={itemVariants}
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-6 mx-auto"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <User className="h-12 w-12 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-4xl font-extrabold text-center text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-300"
              variants={itemVariants}
            >
              Update Your Profile
            </motion.h1>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-6 max-w-2xl mx-auto w-full">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-100/80 mb-1.5 pl-1">
                    Full Name
                    {isTestAccount && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-yellow-300">
                        <Lock size={12} />
                        Locked
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-blue-300/80" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-500/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${isTestAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter your full name"
                        required
                        disabled={isTestAccount}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-100/80 mb-1.5 pl-1">
                    Contact Number
                    {isTestAccount && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-yellow-300">
                        <Lock size={12} />
                        Locked
                      </span>
                    )}
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-blue-300/80" />
                      </div>
                      <input
                        type="tel"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-500/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${isTestAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter your contact number"
                        required
                        disabled={isTestAccount}
                      />
                    </div>
                  </div>
                </div>

                {isTestAccount && (
                  <motion.div 
                    variants={itemVariants}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-yellow-300 text-sm">
                      <Lock size={16} />
                      <span>Test account detected. Name and contact number are locked for security.</span>
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="pt-6">
                  <button
                    type="submit"
                    disabled={isUpdating || isTestAccount}
                    className={`group relative w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isTestAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Updating...
                        </>
                      ) : isTestAccount ? (
                        <>
                          <Lock className="h-5 w-5" />
                          <span>Update Disabled</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          <span>Update Profile</span>
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  </button>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.main>

      <footer className="py-5 text-center text-blue-200/60 text-sm border-t border-white/5 bg-gradient-to-r from-blue-900/40 to-blue-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} SCAN - Senior Citizen Assistance Network</p>
        </div>
      </footer>
    </div>
  );
};

export default CitizenProfile;
