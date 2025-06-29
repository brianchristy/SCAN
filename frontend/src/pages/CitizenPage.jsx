import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, 
  Home, 
  LogOut, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  ChevronDown,
  User,
  Phone,
  Clock,
  CheckCircle2,
  MessageCircle,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  HandHeart,
  ArrowRight,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import seniorBackground from '../assets/seniordashboard.jpeg';
import { formatDate } from '../utils/date';

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

// Help categories and locations data
const helpCategories = [
  { id: 'Driving', label: 'Driving', icon: '🚗' },
  { id: 'Cooking', label: 'Cooking', icon: '👨‍🍳' },
  { id: 'Housekeeping', label: 'Housekeeping', icon: '🧹' },
  { id: 'Gardening', label: 'Gardening', icon: '🌱' },
  { id: 'Companionship', label: 'Companionship', icon: '👥' },
  { id: 'Reading', label: 'Reading', icon: '📖' },
  { id: 'Shopping', label: 'Shopping', icon: '🛒' },
  { id: 'Medical', label: 'Medical', icon: '🏥' },
];

const locations = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

// Utility: check if cancel is allowed (at least 2 hours before requested time)
function isCancelAllowed(helpdate, helptime) {
  if (!helpdate || !helptime) return true;
  try {
    // helpdate: 'YYYY-MM-DD', helptime: 'HH:MM'
    const [year, month, day] = helpdate.split('-').map(Number);
    const [hour, minute] = helptime.split(':').map(Number);
    const requestDate = new Date(year, month - 1, day, hour, minute);
    const cutoff = new Date(requestDate.getTime() - 2 * 60 * 60 * 1000); // minus 2 hours
    return new Date() < cutoff;
  } catch {
    return true;
  }
}

// Utility: check if requested time is at least 3 hours in the future
function isTimeValid(helpdate, helptime) {
  if (!helpdate || !helptime) return false;
  try {
    // helpdate: 'YYYY-MM-DD', helptime: 'HH:MM'
    const [year, month, day] = helpdate.split('-').map(Number);
    const [hour, minute] = helptime.split(':').map(Number);
    const requestDate = new Date(year, month - 1, day, hour, minute);
    const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000); // plus 3 hours
    return requestDate >= threeHoursFromNow;
  } catch {
    return false;
  }
}

// Utility: get minimum time for today (3 hours from now)
function getMinimumTime() {
  const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return threeHoursFromNow.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

const CitizenPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    helptitle: '',
    helpdescription: '',
    additional: '',
    location: '',
    helpdate: '',
    helptime: ''
  });
  
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeError, setTimeError] = useState('');
  const { user, help, markHelpCompleted, isLoading, signout, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const intervalRef = useRef();

  // Check if there's an active help request
  const hasActiveRequest = user?.helptitle && !user?.helpstatus;

  // Initialize form data if there's an active request
  useEffect(() => {
    if (hasActiveRequest) {
      setFormData({
        helptitle: user.helptitle,
        helpdescription: user.helpdescription || '',
        additional: user.additional || '',
        location: user.location || '',
        helpdate: user.helpdate || '',
        helptime: user.helptime || ''
      });
      setSelectedHelp(user.helptitle);
    }
  }, [hasActiveRequest, user]);

  // Polling: refresh user/request status every 10 seconds if waiting for volunteer (not after volunteer is assigned)
  useEffect(() => {
    if (hasActiveRequest && !(user?.volunteerDetails && user.volunteerDetails.isAccepted)) {
      intervalRef.current = setInterval(async () => {
        const previousUser = user;
        await checkAuth();
        // Check if help was completed (user had volunteerDetails before but now doesn't)
        if (previousUser?.volunteerDetails?.name && !user?.volunteerDetails?.name && user?.helpstatus === true) {
          toast.success('Your help request has been marked as completed by the volunteer!');
        }
      }, 10000);
    }
    return () => clearInterval(intervalRef.current);
  }, [hasActiveRequest, user?.volunteerDetails?.isAccepted, checkAuth]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle help request submission
  const handleHelpReq = async (e) => {
    e.preventDefault();
    setTimeError('');
    // Validate required fields
    if (!formData.helpdescription || !formData.location || !formData.helpdate || !formData.helptime) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Validate that requested time is at least 3 hours in the future
    if (!isTimeValid(formData.helpdate, formData.helptime)) {
      setTimeError('Can only request for help at least 3 hours in advance.');
      return;
    }
    setIsSubmitting(true);
    try {
      await help(
        user.email,
        formData.helptitle,
        formData.helpdescription,
        formData.additional,
        formData.location,
        formData.helpdate,
        formData.helptime,
        'request' // Specify this is a help request
      );
      toast.success('Help request submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit help request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel help request
  const handleCancelHelp = async () => {
    if (!window.confirm('Are you sure you want to cancel your help request?')) {
      return;
    }

    try {
      await help(
        user.email,
        null,
        null,
        null,
        null,
        null,
        null,
        'cancel' // Specify this is a cancellation
      );
      
      // Reset form
      setFormData({
        helptitle: '',
        helpdescription: '',
        additional: '',
        location: '',
        helpdate: '',
        helptime: ''
      });
      setSelectedHelp(null);
      
      toast.success('Help request cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling help request:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel help request');
    }
  };

  // Handle marking help as completed
  const handleMarkHelpCompleted = async () => {
    if (!window.confirm('Are you sure you want to mark this request as completed?')) {
      return;
    }

    try {
      await markHelpCompleted(user.email);
      await checkAuth();
      toast.success('Request marked as completed!');
    } catch (error) {
      console.error('Error completing request:', error);
      toast.error(error.response?.data?.message || 'Failed to complete request');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHomeClick = async () => {
    await checkAuth();
    navigate("/citizen-home");
  };

  const handleProfileClick = async () => {
    await checkAuth();
    navigate("/citizen-profile");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Particle Background (optional, not present in CitizenPage) */}
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

      {/* Navigation */}
      <nav className="w-full p-4 fixed top-0 left-0 z-50 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 backdrop-blur-md border-b border-white/10 shadow-lg">
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
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-4 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <User size={20} />
              Profile
            </button>
            <button
              onClick={async () => {
                await checkAuth();
                toast.success('Status refreshed!');
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
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
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-28 pb-16">
        <motion.div 
          className="w-full max-w-7xl flex flex-col lg:flex-row gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Sidebar */}
          <motion.div 
            className="w-full lg:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
              
              <div className="flex items-center space-x-4 mb-6 mt-2">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200 group-hover:duration-300"></div>
                  <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                    <User className="h-8 w-8 text-blue-300 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-lg font-semibold text-white truncate">{user?.name || 'User'}</h2>
                  <p className="text-sm text-blue-200/80 truncate">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                  <p className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-2">Status</p>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    hasActiveRequest && user.volunteerDetails?.name
                      ? 'bg-gradient-to-r from-orange-400/30 to-orange-500/30 text-orange-300 border border-orange-400/40'
                      : hasActiveRequest
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-500/30' 
                      : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                  }`}>
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                        hasActiveRequest && user.volunteerDetails?.name
                          ? 'bg-orange-400'
                          : hasActiveRequest
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      } opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        hasActiveRequest && user.volunteerDetails?.name
                          ? 'bg-orange-400'
                          : hasActiveRequest
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}></span>
                    </span>
                    {hasActiveRequest && user.volunteerDetails?.name
                      ? 'Volunteer Assigned'
                      : hasActiveRequest
                      ? 'Request Active'
                      : 'Idle'}
                  </div>
                </div>
                
                {hasActiveRequest && user.volunteerDetails?.name && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                    <p className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-2">Assigned Volunteer</p>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                        <User className="h-5 w-5 text-blue-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{user.volunteerDetails.name}</p>
                        <div className="flex items-center mt-0.5">
                          <Phone className="h-3 w-3 text-blue-300/70 mr-1.5" />
                          <p className="text-xs text-blue-300/80 truncate">{user.volunteerDetails.contactno}</p>
                        </div>
                      </div>
                      <a 
                        href={`tel:${user.volunteerDetails.contactno}`}
                        className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="flex-1"
            variants={itemVariants}
          >
            {!hasActiveRequest ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-white/10 mb-4"
                    >
                      <HeartPulse className="h-8 w-8 text-blue-300" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
                      How can we help you today?
                    </h1>
                    <p className="text-blue-100/80">Select the type of assistance you need from our volunteers</p>
                  </div>

                  {/* Help Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {helpCategories.map((category) => (
                      <motion.button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setSelectedHelp(category.id);
                          setFormData(prev => ({ ...prev, helptitle: category.id }));
                        }}
                        className={`group relative flex flex-col items-center justify-center p-6 rounded-xl transition-all overflow-hidden ${
                          selectedHelp === category.id 
                            ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/40 border border-blue-500/30' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                        }`}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative z-10 flex flex-col items-center">
                          <span className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                            {category.icon}
                          </span>
                          <span className="text-sm font-medium text-white">
                            {category.label}
                          </span>
                        </div>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Help Form */}
                  <AnimatePresence>
                    {selectedHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 border-t border-white/10">
                          <div className="flex items-center mb-6">
                            <div className="h-1 w-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3"></div>
                            <h3 className="text-xl font-semibold text-white">Request Details</h3>
                          </div>
                          
                          <form onSubmit={handleHelpReq} className="space-y-6">
                            <div className="group">
                              <label htmlFor="helpdescription" className="block text-sm font-medium text-blue-300 mb-2">
                                What do you need help with? <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                                <textarea
                                  id="helpdescription"
                                  name="helpdescription"
                                  rows={3}
                                  value={formData.helpdescription}
                                  onChange={handleChange}
                                  className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                  placeholder="Please describe what you need help with..."
                                  required
                                />
                              </div>
                            </div>

                            <div className="group">
                              <label htmlFor="additional" className="block text-sm font-medium text-blue-300 mb-2">
                                Additional Information
                              </label>
                              <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                                <input
                                  type="text"
                                  id="additional"
                                  name="additional"
                                  value={formData.additional}
                                  onChange={handleChange}
                                  className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                  placeholder="Any special requirements?"
                                />
                              </div>
                            </div>

                            <div className="group">
                              <label htmlFor="location" className="block text-sm font-medium text-blue-300 mb-2">
                                Your Location <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-200 group-hover:duration-300"></div>
                                <div className="relative">
                                  <select
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-10"
                                    required
                                  >
                                    <option value="" className="bg-gray-800/90 text-white">Select your location</option>
                                    {locations.map((loc) => (
                                      <option key={loc} value={loc} className="bg-gray-800/90 text-white">
                                        {loc}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-300">
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            </div>

                              <div className="group">
                              <label htmlFor="helpdate" className="block text-sm font-medium text-blue-300 mb-2">
                                Date Needed <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="date"
                                  id="helpdate"
                                  name="helpdate"
                                  value={formData.helpdate}
                                  onChange={handleChange}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                  required
                                />
                              </div>
                            </div>

                            <div className="group">
                              <label htmlFor="helptime" className="block text-sm font-medium text-blue-300 mb-2">
                                Time Needed <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="time"
                                  id="helptime"
                                  name="helptime"
                                  value={formData.helptime}
                                  onChange={handleChange}
                                  className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                  required
                                />
                              </div>
                            </div>

                            {timeError && (
                              <div className="text-red-400 text-sm mt-1 flex items-center">
                                <AlertCircle size={16} className="mr-1" /> {timeError}
                              </div>
                            )}

                            <div className="pt-2">
                              <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className={`group relative w-full py-3.5 px-6 rounded-xl font-medium text-white shadow-lg overflow-hidden ${
                                  isSubmitting 
                                    ? 'bg-blue-600/70 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                }`}
                                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                              >
                                <span className="relative z-10 flex items-center justify-center">
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <HeartPulse className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                      <span>Request Help</span>
                                    </>
                                  )}
                                </span>
                                {!isSubmitting && (
                                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                                )}
                              </motion.button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-10">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/30 border border-white/10 mb-6 mx-auto"
                    >
                      <CheckCircle2 className="h-9 w-9 text-green-400" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-green-300 to-white bg-clip-text text-transparent">
                      {user.volunteerDetails?.name ? "Volunteer Assigned!" : "Help Request Submitted!"}
                    </h1>
                    <p className="text-blue-100/80 max-w-lg mx-auto">
                      {user.volunteerDetails?.name 
                        ? "Your volunteer is on the way. You can contact them below."
                        : "We've received your request and will connect you with a volunteer soon."
                      }
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                      <div className="h-1 w-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3"></div>
                      <h3 className="text-xl font-semibold text-white">Request Details</h3>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-start p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                          <span className="text-xl">
                            {helpCategories.find(cat => cat.id === formData.helptitle)?.icon || '❓'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-blue-300 mb-1">Type of Help</h4>
                          <p className="text-white font-medium">
                            {helpCategories.find(cat => cat.id === formData.helptitle)?.label || formData.helptitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                          <AlertCircle className="h-5 w-5 text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-blue-300 mb-1">Description</h4>
                          <p className="text-white">{formData.helpdescription}</p>
                        </div>
                      </div>
                      <div className="flex items-start p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                          <MapPin className="h-5 w-5 text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-blue-300 mb-1">Location</h4>
                          <p className="text-white">{formData.location}</p>
                        </div>
                      </div>
                      {formData.helpdate && (
                        <div className="flex items-start p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                            <Calendar className="h-5 w-5 text-blue-300" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-blue-300 mb-1">Date Needed</h4>
                            <p className="text-white">{formData.helpdate}</p>
                          </div>
                        </div>
                      )}
                      {formData.helptime && (
                        <div className="flex items-start p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center border border-white/10 shadow-inner">
                            <Clock className="h-5 w-5 text-blue-300" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-blue-300 mb-1">Time Needed</h4>
                            <p className="text-white">{formData.helptime}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {user.volunteerDetails?.name ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-green-400 mb-2">Volunteer Assigned!</h3>
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-green-300" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{user.volunteerDetails.name}</h4>
                                <p className="text-sm text-green-300">Volunteer</p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center space-x-2">
                              <a 
                                href={`tel:${user.volunteerDetails.contactno}`}
                                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600/30 border border-green-500/30 rounded-lg text-green-200 hover:bg-green-600/40 transition-colors whitespace-nowrap"
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Call Volunteer
                              </a>
                            </div>
                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <h4 className="text-sm font-medium text-blue-300 mb-2">Completion Code</h4>
                              <p className="text-white text-lg font-mono font-bold tracking-wider">
                                {user.volunteerDetails.completionCode}
                              </p>
                              <p className="text-blue-200 text-sm mt-2">
                                Provide this code to your volunteer when they complete your request.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-yellow-400 mb-1">Waiting for Volunteer</h3>
                          <p className="text-yellow-300">We're looking for an available volunteer to assist you. This may take some time. We will notify you when a volunteer is found.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Need to make changes?</h3>
                    <p className="text-gray-400 mb-4">
                      If you need to update your request or have any questions, please contact our support team.
                    </p>
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleCancelHelp}
                        className={`flex-1 flex items-center justify-center px-4 py-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors ${!isCancelAllowed(formData.helpdate, formData.helptime) ? 'cursor-not-allowed' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isCancelAllowed(formData.helpdate, formData.helptime)}
                        title={!isCancelAllowed(formData.helpdate, formData.helptime) ? 'Cancellation is only allowed up to 2 hours before the requested time.' : ''}
                      >
                        <X className="h-5 w-5 mr-2" />
                        Cancel Request
                      </motion.button>
                      <button className="flex-1 flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
      <footer className="py-5 text-center text-blue-200/60 text-sm border-t border-white/5 bg-gradient-to-r from-blue-900/40 to-blue-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} SCAN - Senior Citizen Assistance Network</p>
        </div>
      </footer>
    </div>
  );
};

export default CitizenPage;
