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
  MapPin,
  HandHeart,
  Loader2,
  ChevronDown,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import seniorBackground from '../assets/seniordashboard.jpeg';

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

const VolunteerProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, signout, isAuthenticated, checkAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [contactNo, setContactNo] = useState(user?.contactno || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [location, setLocation] = useState(user?.location || '');
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
    
    // For test accounts, only allow updating skills and location
    if (isTestAccount) {
      setIsUpdating(true);
      try {
        await updateProfile({ 
          name: user?.name, // Keep original name
          contactno: user?.contactno, // Keep original contact number
          skills: Array.isArray(skills) ? skills : [skills].filter(Boolean), 
          location 
        });
        toast.success('Profile updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/volunteer-home');
        }, 1500);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
      } finally {
        setIsUpdating(false);
      }
      return;
    }
    
    // Validate phone number for non-test accounts
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactNo)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateProfile({ 
        name, 
        contactno: contactNo, // Match backend field name
        skills: Array.isArray(skills) ? skills : [skills].filter(Boolean), 
        location 
      });
      toast.success('Profile updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/volunteer-home');
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

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSkills((prev) =>
      prev.includes(value)
        ? prev.filter((skill) => skill !== value)
        : [...prev, value]
    );
  };

  const handleHomeClick = async () => {
    await checkAuth();
    navigate("/volunteer-home");
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-purple-900/80 backdrop-blur-sm" />
        </div>
      {/* End background */}

      {/* Navbar */}
      <header className="w-full p-4 fixed top-0 left-0 z-50 bg-gradient-to-r from-indigo-900/70 to-purple-900/70 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/volunteer-home"
            className="flex items-center space-x-2 group"
          >
            <HandHeart className="h-8 w-8 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-300 to-purple-200 bg-clip-text text-transparent">
              SCAN
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
        className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="w-full max-w-3xl bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden relative"
          variants={itemVariants}
          style={{
            boxShadow: '0 8px 32px 0 rgba(76, 29, 149, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6 mx-auto"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <User className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-4xl font-extrabold text-center text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-300"
              variants={itemVariants}
            >
              Update Your Profile
            </motion.h1>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-medium text-indigo-100 mb-2">
                  Full Name
                  {isTestAccount && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-yellow-300">
                      <Lock size={12} />
                      Locked
                    </span>
                  )}
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/30 to-purple-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${isTestAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Enter your full name"
                      required
                      disabled={isTestAccount}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="contactNo" className="block text-sm font-medium text-indigo-100 mb-2">
                  Contact Number
                  {isTestAccount && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-yellow-300">
                      <Lock size={12} />
                      Locked
                    </span>
                  )}
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/30 to-purple-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-indigo-400" />
                    </div>
                    <input
                      type="tel"
                      id="contactNo"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${isTestAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Your contact number"
                      required
                      disabled={isTestAccount}
                    />
                  </div>
                </div>
              </motion.div>

              {isTestAccount && (
                <motion.div 
                  variants={itemVariants}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-yellow-300 text-sm">
                    <Lock size={16} />
                    <span>Test account detected. Name and contact number are locked. You can still update skills and location.</span>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-indigo-100 mb-3">
                  Skills
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Driving",
                    "Cooking",
                    "Housekeeping",
                    "Gardening",
                    "Companionship",
                    "Reading",
                    "Shopping",
                    "Medical Assistance",
                  ].map((skill) => (
                    <motion.label 
                      key={skill} 
                      className={`flex items-center space-x-3 p-3 rounded-xl border ${skills.includes(skill) ? 'bg-indigo-500/20 border-indigo-400/30' : 'bg-white/5 border-white/10'} hover:bg-indigo-500/20 hover:border-indigo-400/30 transition-colors cursor-pointer`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="checkbox"
                        value={skill}
                        checked={skills.includes(skill)}
                        onChange={handleSkillChange}
                        className="h-5 w-5 rounded border-white/30 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-white">{skill}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="location" className="block text-sm font-medium text-indigo-100 mb-2">
                  Location
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/30 to-purple-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-indigo-400" />
                    </div>
                    <select
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-colors"
                      required
                    >
                      <option value="" className="bg-indigo-900/90 text-white">Select your location</option>
                      <option value="Thiruvananthapuram" className="bg-indigo-900/90 text-white">Thiruvananthapuram</option>
                      <option value="Kollam" className="bg-indigo-900/90 text-white">Kollam</option>
                      <option value="Alappuzha" className="bg-indigo-900/90 text-white">Alappuzha</option>
                      <option value="Pathanamthitta" className="bg-indigo-900/90 text-white">Pathanamthitta</option>
                      <option value="Kottayam" className="bg-indigo-900/90 text-white">Kottayam</option>
                      <option value="Idukki" className="bg-indigo-900/90 text-white">Idukki</option>
                      <option value="Ernakulam" className="bg-indigo-900/90 text-white">Ernakulam</option>
                      <option value="Thrissur" className="bg-indigo-900/90 text-white">Thrissur</option>
                      <option value="Palakkad" className="bg-indigo-900/90 text-white">Palakkad</option>
                      <option value="Malappuram" className="bg-indigo-900/90 text-white">Malappuram</option>
                      <option value="Kozhikode" className="bg-indigo-900/90 text-white">Kozhikode</option>
                      <option value="Wayanad" className="bg-indigo-900/90 text-white">Wayanad</option>
                      <option value="Kannur" className="bg-indigo-900/90 text-white">Kannur</option>
                      <option value="Kasaragod" className="bg-indigo-900/90 text-white">Kasaragod</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="pt-4"
                variants={itemVariants}
              >
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="group relative w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Updating...
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
            </form>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.footer 
          className="mt-12 text-center text-indigo-100/50 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p>© {new Date().getFullYear()} SCAN - Senior Citizen Assistance Network</p>
        </motion.footer>
      </motion.main>
    </div>
  );
};

export default VolunteerProfile;
