import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  HandHeart, 
  Home, 
  LogOut, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  Clock,
  CheckCircle2,
  User,
  Phone,
  AlertTriangle,
  ChevronDown,
  MessageCircle,
  X,
  CheckCircle,
  RefreshCw,
  Filter,
  Check as CheckIcon,
  X as XIcon,
  Search,
  Calendar,
  Info,
  ArrowLeft
} from 'lucide-react';
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

const VolunteerPage = () => {
  const navigate = useNavigate();
  const { 
    user, 
    vhelp, 
    fetchProducts, 
    products, 
    signout, 
    markHelpCompleted,
    isAuthenticated,
    checkAuth
  } = useAuthStore();
  
  const [acceptedRequest, setAcceptedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterHelpType, setFilterHelpType] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionCode, setCompletionCode] = useState('');
  const [completionError, setCompletionError] = useState('');
  
  // Help categories for filtering
  const helpCategories = [
    { id: 'driving', label: 'Driving', icon: '🚗' },
    { id: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
    { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
    { id: 'gardening', label: 'Gardening', icon: '🌱' },
    { id: 'companionship', label: 'Companionship', icon: '👥' },
    { id: 'shopping', label: 'Shopping', icon: '🛒' },
    { id: 'medical', label: 'Medical', icon: '🏥' },
  ];

  // Locations for filtering
  const locations = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  // Function to refresh the data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const fetchedProducts = await fetchProducts();

      if (Array.isArray(fetchedProducts)) {
        // Filter out invalid or undefined requests
        const validProducts = fetchedProducts.filter(
          (req) => req && req.helptitle && req.helpdescription
        );
        
        // Check for any previously accepted request associated with this volunteer
        const alreadyAccepted = validProducts.find(
          (req) => 
            req.volunteerDetails && 
            req.volunteerDetails.isAccepted &&
            String(req.volunteerDetails.volunteerId) === String(user?._id)
        );

        // Set location filter to volunteer's location if not already set
        if (user?.location && !filterLocation) {
          setFilterLocation(user.location);
        }

        if (alreadyAccepted) {
          setAcceptedRequest(alreadyAccepted);
          setActiveTab('accepted');
        } else if (activeTab === 'accepted') {
          // If no accepted request but we're on the accepted tab, switch to available
          setActiveTab('available');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      refreshData();
    }
  }, [isAuthenticated, navigate]);

  // Handle refresh button click
  const handleRefresh = async () => {
    await refreshData();
  };

  // Set default filterHelpType to 'Your Preference' if user has skills
  useEffect(() => {
    if (user?.skills && user.skills.length > 0 && filterHelpType === '') {
      setFilterHelpType('__PREFERENCE__');
    }
    // eslint-disable-next-line
  }, [user]);

  // Filter available requests based on selected filters
  const filteredRequests = (products || []).filter(request => {
    // Skip invalid or undefined requests
    if (!request || !request.helptitle || !request.helpdescription) return false;
    
    // Skip requests that are already accepted by someone
    if (request.volunteerDetails?.isAccepted) return false;
    
    // Apply location filter
    if (filterLocation && request.location !== filterLocation) return false;
    
    // Apply help type filter
    if (filterHelpType === '__PREFERENCE__') {
      // Only show requests matching any of the volunteer's skills
      if (!user?.skills || !user.skills.includes(request.helptitle)) return false;
    } else if (filterHelpType && request.helptitle !== filterHelpType) {
      return false;
    }
    
    // Apply search query
    if (searchQuery && !request.helptitle.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !request.helpdescription.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !request.location?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filterDate && request.helpdate !== filterDate) return false;
    
    return true;
  });

  const handleAcceptRequest = async (request) => {
    if (!window.confirm('Are you sure you want to accept this help request?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const acceptedRequest = await vhelp(request.email, request);
      if (acceptedRequest) {
        setAcceptedRequest(acceptedRequest);
        setActiveTab('accepted');
        toast.success('Request accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      // Check for 409 or 400 error (help no longer available or already accepted)
      const msg = error?.response?.data?.message?.toLowerCase() || '';
      if (
        error?.response?.status === 409 ||
        (error?.response?.status === 400 && msg.includes('already accepted')) ||
        msg.includes('no longer available')
      ) {
        toast.error('Help request is no longer available.');
        await refreshData();
      } else {
      toast.error(error.message || 'Failed to accept request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRequest = async () => {
    if (!acceptedRequest) return;
    
    setShowCompletionModal(true);
  };

  const handleSubmitCompletion = async () => {
    if (!completionCode || completionCode.length !== 6) {
      setCompletionError('Please enter a valid 6-digit code');
      return;
    }

    setCompletionError('');
    setIsCompleting(true);
    
    try {
      // Mark the request as completed with the completion code
      await markHelpCompleted(acceptedRequest.email, completionCode);
      
      // Clear the accepted request and switch to the available tab
      setAcceptedRequest(null);
      setActiveTab('available');
      setShowCompletionModal(false);
      setCompletionCode('');
      
      // Show success message
      toast.success('Request marked as completed!');
      
      // Refresh the data to ensure everything is in sync
      await refreshData();
    } catch (error) {
      console.error('Error completing request:', error);
      if (error.response?.data?.message) {
        setCompletionError(error.response.data.message);
      } else {
      toast.error(error.message || 'Failed to complete request');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleHomeClick = async () => {
    await checkAuth();
    navigate("/volunteer-home");
  };

  const handleProfileClick = async () => {
    await checkAuth();
    navigate("/volunteer-profile");
  };

  const renderAcceptedRequest = () => (
    <motion.div 
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Accepted Request
        </h2>
        <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full">
          In Progress
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-indigo-200">Citizen Details</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="h-5 w-5 text-indigo-300 mr-3" />
              <span className="text-white">
                {acceptedRequest.name || 'Name not provided'}
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-indigo-300 mr-3" />
              <span className="text-white">
                {acceptedRequest.contactno || 'Contact not provided'}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-indigo-300 mr-3" />
              <span className="text-white">
                {acceptedRequest.location || 'Location not specified'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-indigo-200">Request Details</h3>
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-2">
              {acceptedRequest.helptitle}
            </h4>
            <p className="text-indigo-100">
              {acceptedRequest.helpdescription}
            </p>
            {acceptedRequest.additional && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  <span className="font-medium">Note:</span> {acceptedRequest.additional}
                </p>
              </div>
            )}
            {acceptedRequest.helpdate && (
              <div className="mt-2 flex items-center text-indigo-200 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Date Needed: {acceptedRequest.helpdate}</span>
              </div>
            )}
            {acceptedRequest.helptime && (
              <div className="mt-1 flex items-center text-indigo-200 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>Time Needed: {acceptedRequest.helptime}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-sm text-indigo-300">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Requested on {new Date(acceptedRequest.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        <a
          href={`tel:${acceptedRequest.contactno}`}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/20"
        >
          <Phone className="h-5 w-5" />
          Call Citizen
        </a>
        <button
          onClick={handleCompleteRequest}
          disabled={isCompleting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
        >
          {isCompleting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Mark as Completed
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderAvailableRequests = () => (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-white">Available Requests</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 border-2 border-indigo-500/40 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white/20 border-2 border-indigo-500/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all shadow-sm"
              >
                <option value="" className="bg-gray-800 text-white">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-gray-800 text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Help Type</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <select
                value={filterHelpType}
                onChange={(e) => setFilterHelpType(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white/20 border-2 border-indigo-500/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all shadow-sm"
              >
                <option value="__PREFERENCE__" className="bg-gray-800 text-white">Your Preference</option>
                <option value="" className="bg-gray-800 text-white">All Types</option>
                {helpCategories.map((category) => (
                  <option key={category.id} value={category.label} className="bg-gray-800 text-white">
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Date Needed</label>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/20 border-2 border-indigo-500/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterLocation('');
                setFilterHelpType('');
                setFilterDate('');
                setSearchQuery('');
              }}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 border border-indigo-500/50"
            >
              <XIcon className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-indigo-400 animate-spin" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 p-8 min-h-[260px] flex flex-col justify-between"
            >
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {request.helptitle}
                  </h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1 rounded-full">
                    {request.location || 'Location not specified'}
                  </span>
                </div>
                <p className="text-indigo-100 mb-4 text-lg line-clamp-3">
                  {request.helpdescription}
                </p>
                {request.additional && (
                  <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <span className="text-yellow-300 text-base font-medium">Note: {request.additional}</span>
                  </div>
                )}
                {request.helpdate && (
                  <div className="flex items-center text-indigo-200 text-base mb-1">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Date Needed: {request.helpdate}</span>
                  </div>
                )}
                {request.helptime && (
                  <div className="flex items-center text-indigo-200 text-base mb-1">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Time Needed: {request.helptime}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-indigo-300 flex items-center">
                  <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleAcceptRequest(request)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50"
                  style={{ minWidth: '100px' }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            No help requests found
          </h3>
          <p className="text-indigo-200 mb-6">
            {filterLocation || filterHelpType || searchQuery
              ? 'Try adjusting your filters or search query'
              : 'Check back later for new requests'}
          </p>
          <button
            onClick={() => {
              setFilterLocation('');
              setFilterHelpType('');
              setSearchQuery('');
            }}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/20"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );

  // Completion Modal
  const renderCompletionModal = () => (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${showCompletionModal ? 'block' : 'hidden'}`}>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Complete Help Request</h3>
        <p className="text-gray-300 mb-6">
          Please enter the 6-digit completion code provided by the citizen to mark this request as completed.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">
              Completion Code
            </label>
            <input
              type="text"
              value={completionCode}
              onChange={(e) => setCompletionCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              maxLength={6}
            />
            {completionError && (
              <p className="text-red-400 text-sm mt-2">{completionError}</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowCompletionModal(false);
                setCompletionCode('');
                setCompletionError('');
              }}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCompletion}
              disabled={isCompleting || completionCode.length !== 6}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isCompleting ? 'Completing...' : 'Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-4 py-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <User size={20} />
              Profile
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 relative z-10 pt-24">
        <motion.div 
          className="w-full max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div 
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
            variants={itemVariants}
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Help Requests
              </h1>
              <p className="text-indigo-200">
                {activeTab === 'available' 
                  ? 'Browse and accept help requests from seniors in your area'
                  : 'Manage your accepted help request'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-sm p-1 rounded-xl border border-white/10 w-fit" 
            variants={itemVariants}
          >
            <button
              onClick={() => setActiveTab('available')}
              disabled={!!acceptedRequest}
              className={`px-6 py-2.5 font-medium rounded-lg transition-all flex items-center gap-2 ${
                !!acceptedRequest
                  ? 'text-indigo-400/50 cursor-not-allowed'
                  : activeTab === 'available'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-indigo-200 hover:bg-white/5'
              }`}
            >
              <Info className="h-4 w-4" />
              Available Requests
              {filteredRequests.length > 0 && (
                <span className="bg-indigo-500/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {filteredRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => acceptedRequest && setActiveTab('accepted')}
              disabled={!acceptedRequest}
              className={`px-6 py-2.5 font-medium rounded-lg transition-all flex items-center gap-2 ${
                !acceptedRequest
                  ? 'text-indigo-400/50 cursor-not-allowed'
                  : activeTab === 'accepted'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-indigo-200 hover:bg-white/5'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              My Accepted Request
              {acceptedRequest && (
                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {activeTab === 'available' ? renderAvailableRequests() : renderAcceptedRequest()}
          </motion.div>
        </motion.div>
      </main>

      {renderCompletionModal()}

      {/* Footer */}
      <footer className="py-6 text-center text-indigo-200 text-sm border-t border-white/10 bg-gradient-to-r from-indigo-900/60 to-purple-900/40 backdrop-blur-md z-20">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} SCAN - Senior Citizen Assistance Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default VolunteerPage;
