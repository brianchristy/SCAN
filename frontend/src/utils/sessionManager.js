import { useAuthStore } from '../store/authStore';

const API_URL =
  import.meta.env.MODE === "development"
    ? "/api/auth"
    : "/api/auth";

class SessionManager {
  constructor() {
    this.activityTimeout = null;
    this.heartbeatInterval = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupActivityTracking();
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

  setupConnectionMonitoring() {
    const handleOnline = () => {
      // Connection restored
    };

    const handleOffline = () => {
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
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Heartbeat failed');
      }

      const data = await response.json();
      // Update tokens
      sessionStorage.setItem('sessionToken', data.sessionToken);
      sessionStorage.setItem('refreshToken', data.refreshToken);
    } catch (error) {
      this.handleConnectionLoss();
    }
  }

  handleInactivity() {
    this.forceLogout('Session expired due to inactivity');
  }

  handleConnectionLoss() {
    this.forceLogout('Connection terminated');
  }

  handleInternalError() {
    this.forceLogout('Internal error occurred');
  }

  forceLogout(reason = 'Session terminated') {
    const { signout } = useAuthStore.getState();
    
    // Clear all stored data
    localStorage.removeItem('scanUser');
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('refreshToken');
    
    // Call signout to clear auth state
    signout();
  }

  // Method to be called when user is banned or account is deleted
  handleAccountTermination() {
    this.forceLogout('Account terminated by administrator');
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager; 
