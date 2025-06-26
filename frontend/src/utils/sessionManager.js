import { useAuthStore } from '../store/authStore';

//const API_URL = "https://scan-backend-64s8.onrender.com";
// const API_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5000/api/auth"
//     : "/api/auth";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/auth"
    : import.meta.env.VITE_API_URL;

class SessionManager {
  constructor() {
    this.activityTimeout = null;
    this.heartbeatInterval = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupActivityTracking();
    this.setupBrowserCloseDetection();
    this.setupConnectionMonitoring();
    this.startHeartbeat();
    
    this.isInitialized = true;
  }

  destroy() {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.isInitialized = false;
  }

  setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetActivityTimeout = () => {
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }
      
      // Set 15-minute inactivity timeout
      this.activityTimeout = setTimeout(() => {
        this.handleInactivity();
      }, 15 * 60 * 1000); // 15 minutes
    };

    events.forEach(event => {
      document.addEventListener(event, resetActivityTimeout, true);
    });

    // Initial timeout
    resetActivityTimeout();
  }

  setupBrowserCloseDetection() {
    const handleBeforeUnload = () => {
      // Clear any stored tokens
      localStorage.removeItem("userToken");
      sessionStorage.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);
  }

  setupConnectionMonitoring() {
    const handleOnline = () => {
      console.log('Connection restored');
    };

    const handleOffline = () => {
      console.log('Connection lost');
      this.handleConnectionLoss();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  startHeartbeat() {
    // Send heartbeat every 5 minutes to keep session alive
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 5 * 60 * 1000); // 5 minutes
  }

  async sendHeartbeat() {
    try {
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Heartbeat failed');
      }
    } catch (error) {
      console.error('Heartbeat failed:', error);
      this.handleConnectionLoss();
    }
  }

  handleInactivity() {
    console.log('Session expired due to inactivity');
    this.forceLogout('Session expired due to inactivity');
  }

  handleConnectionLoss() {
    console.log('Connection terminated');
    this.forceLogout('Connection terminated');
  }

  handleInternalError() {
    console.log('Internal error occurred');
    this.forceLogout('Internal error occurred');
  }

  forceLogout(reason = 'Session terminated') {
    const { signout } = useAuthStore.getState();
    
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies by setting them to expire
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Call signout to clear auth state
    signout();
    
    console.log(`Logged out: ${reason}`);
  }

  // Method to be called when user is banned or account is deleted
  handleAccountTermination() {
    this.forceLogout('Account terminated by administrator');
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager; 
