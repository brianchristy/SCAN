import { useEffect } from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LogOut, User, HeartHandshake, Home, HandHeart } from "lucide-react";
import backgroundImage from "../assets/signup-bg.jpg";
import toast from "react-hot-toast";
import Particles from 'react-particles';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const VolunteerHome = () => {
  const navigate = useNavigate();
  const { user, signout, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
    navigate("/volunteer-home");
  };

  const handleProfileClick = async () => {
    await checkAuth();
    navigate("/volunteer-profile");
  };

  const handleVolunteersClick = async () => {
    await checkAuth();
    navigate("/volunteers");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          id="tsparticles"
          options={{
            background: {
              color: {
                value: "#1e293b",
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 100,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#60a5fa",
              },
              links: {
                color: "#60a5fa",
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 60,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
        />
      </div>
      
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-purple-900/80 backdrop-blur-sm" />
      </div>

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

      {/* Main Content */}
      <motion.main 
        className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="w-full max-w-5xl bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/10 overflow-hidden relative"
          variants={itemVariants}
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
              <HandHeart className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-300"
              variants={itemVariants}
            >
              Welcome, <span className="text-white">{user?.name?.split(' ')[0]}</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-center text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              <span className="text-indigo-200">"</span>Alone, we can do so little; together, we can do so much.
              <span className="block mt-2">Thank you for being the helping hand in someone's life!<span className="text-indigo-200">"</span></span>
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-6 mt-12"
              variants={itemVariants}
            >
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <User size={20} className="flex-shrink-0" />
                <span>View or Update Profile</span>
              </button>
              <button
                onClick={handleVolunteersClick}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <HeartHandshake size={20} className="flex-shrink-0" />
                <span>Help a Citizen</span>
              </button>
            </motion.div>
            
            <motion.div 
              className="mt-12 text-center text-indigo-100/70 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p>Your time and effort make a real difference in people's lives.</p>
              <p className="mt-1">Thank you for being a part of our volunteer community!</p>
            </motion.div>
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

export default VolunteerHome;
