import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import sessionManager from "../utils/sessionManager.js";

const API_URL =
  import.meta.env.MODE === "development"
    ? "/api/auth"
    : "/api/auth";

// Configure axios to include auth token in headers
axios.interceptors.request.use(
  (config) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    if (sessionToken) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Load persisted auth state from localStorage
function getInitialAuthState() {
  let user = null;
  let isAuthenticated = false;
  try {
    const userStr = localStorage.getItem('scanUser');
    if (userStr) {
      user = JSON.parse(userStr);
      // Check if session token exists in sessionStorage
      const sessionToken = sessionStorage.getItem('sessionToken');
      isAuthenticated = !!sessionToken;
    }
  } catch {}
  return { user, isAuthenticated };
}

const initialAuth = getInitialAuthState();

export const useAuthStore = create((set, get) => ({
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  error: null,
  isLoading: false,
  isCheckingAuth: false,
  message: null,
  
  clearError: () => set({ error: null }),
  
  // Helper to normalize role names for comparison
  normalizeRole: (role) => {
    if (!role) return '';
    return role.toLowerCase().replace(/\s+/g, '');
  },
  
  // Check if current user has a specific role
  hasRole: (role) => {
    const { user, normalizeRole } = get();
    if (!user || !user.category) return false;
    return normalizeRole(user.category) === normalizeRole(role);
  },
  
  // Check if current user is a volunteer
  isVolunteer: () => {
    const { user, normalizeRole } = get();
    if (!user || !user.category) return false;
    return normalizeRole(user.category) === 'volunteer';
  },
  
  // Check if current user is a citizen (handles both 'Citizen' and 'Senior Citizen')
  isCitizen: () => {
    const { user, normalizeRole } = get();
    if (!user || !user.category) return false;
    const role = normalizeRole(user.category);
    return role === 'citizen' || role === 'seniorcitizen';
  },

  signup: async (
    email,
    password,
    name,
    contactno,
    category,
    skills = null,
    location = null
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
        contactno,
        category,
        skills: category === "Volunteer" ? skills : null, // Add skills if Volunteer
        location: category === "Volunteer" ? location : null, // Add location if Volunteer
      });

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  signout: async () => {
    set({ isLoading: true, error: null });
    try {
      // Call the backend API to handle signout
      await axios.post(`${API_URL}/logout`);

      // Clear session manager
      sessionManager.destroy();

      // Clear all stored data
      localStorage.removeItem('scanUser');
      sessionStorage.removeItem('sessionToken');
      sessionStorage.removeItem('refreshToken');
      
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });

      window.location.href = "/login"; // Redirect to login page after signout

    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing out",
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      
      // Store tokens in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('sessionToken', response.data.sessionToken);
      sessionStorage.setItem('refreshToken', response.data.refreshToken);
      
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
      });
      // Persist user to localStorage
      localStorage.setItem('scanUser', JSON.stringify(response.data.user));

      // Initialize session manager after successful login
      sessionManager.init();

      return { success: true };
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          if (error.response.data.message === 'Email not verified') {
            errorMessage = 'Please verify your email before logging in';
          } else if (error.response.data.message === 'Incorrect password') {
            errorMessage = 'Incorrect password';
          } else if (error.response.data.message === 'No account found with this email') {
            errorMessage = 'No account found with this email';
          } else if (error.response.data.message === 'Invalid credentials') {
            // Fallback for any other 401 errors
            errorMessage = 'Invalid email or password';
          }
        } else if (error.response.status === 403 && error.response.data.isBanned) {
          errorMessage = 'Your account has been suspended by an administrator';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Invalid request';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/update-profile`,
        profileData
      );
      set({ user: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating profile",
        isLoading: false,
      });
      toast.error("Error updating profile");
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response.data.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, isAuthenticated: false });
    try {
      const response = await axios.get(`${API_URL}/me`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
        error: null,
      });
      // Persist to localStorage
      localStorage.setItem('scanUser', JSON.stringify(response.data.user));

      // Initialize session manager if not already done
      if (!sessionManager.isInitialized) {
        sessionManager.init();
      }

      return response.data.user;
    } catch (error) {
      // If session token is expired, try to refresh
      if (error.response?.status === 401) {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_URL}/refresh-token`, {
              refreshToken
            });
            
            // Store new tokens
            sessionStorage.setItem('sessionToken', refreshResponse.data.sessionToken);
            sessionStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
            
            // Retry the original request
            const retryResponse = await axios.get(`${API_URL}/me`);
            set({
              user: retryResponse.data.user,
              isAuthenticated: true,
              isCheckingAuth: false,
              error: null,
            });
            localStorage.setItem('scanUser', JSON.stringify(retryResponse.data.user));
            
            if (!sessionManager.isInitialized) {
              sessionManager.init();
            }
            
            return retryResponse.data.user;
          } catch (refreshError) {
            // Refresh failed, clear tokens and logout
            sessionStorage.removeItem('sessionToken');
            sessionStorage.removeItem('refreshToken');
            localStorage.removeItem('scanUser');
            set({
              isAuthenticated: false,
              user: null,
              isCheckingAuth: false,
              error: 'Session expired. Please log in again.',
            });
            return null;
          }
        }
      }
      
      // Handle banned user case
      if (error.response?.status === 403 && error.response?.data?.isBanned) {
        // Clear user data and tokens
        set({
          isAuthenticated: false,
          user: null,
          isCheckingAuth: false,
          error: 'Your account has been suspended by an administrator.',
        });
        
        // Clear any stored tokens
        sessionStorage.removeItem('sessionToken');
        sessionStorage.removeItem('refreshToken');
        
        // Handle account termination
        sessionManager.handleAccountTermination();
        
        // Remove from localStorage
        localStorage.removeItem('scanUser');
        
        return null;
      }

      // Handle session expiration
      if (error.response?.status === 401) {
        const message = error.response?.data?.message;
        if (message?.includes('inactivity') || message?.includes('expired') || message?.includes('Invalid session')) {
          sessionManager.handleInactivity();
          // Remove from localStorage
          localStorage.removeItem('scanUser');
          return null;
        }
      }

      // Handle internal errors
      if (error.response?.status >= 500) {
        sessionManager.handleInternalError();
        // Remove from localStorage
        localStorage.removeItem('scanUser');
        return null;
      }
      
      set({
        isAuthenticated: false,
        user: null,
        isCheckingAuth: false,
        error: error.response?.data?.message || 'Authentication check failed',
      });
      // Remove from localStorage
      localStorage.removeItem('scanUser');
      return null;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || "Error resetting password",
      });
      throw error;
    }
  },

  help: async (email, helptitle, helpdescription, additional, location, helpdate, helptime, action = 'request') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/citizens`, {
        email,
        helptitle,
        helpdescription,
        additional,
        location,
        helpdate,
        helptime,
        action
      });
      set({
        message: response.data.message,
        user: response.data.user, // Update the user in the store
        isLoading: false,
      });
      return response.data; // Return the full response
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error in help",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/volunteers`);
      
      if (response.data.success) {
        set({ products: response.data.data });
        return response.data.data; // Return the data for use in components
      } else {
        const errorMsg = response.data.message || 'Unknown error fetching products';
        set({ error: errorMsg });
        return [];
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error fetching products";
      set({ error: errorMsg });
      return [];
    }
  },

  vhelp: async (email, request) => {
    set({ isLoading: true, error: null });
    try {
      const state = useAuthStore.getState();
      const response = await axios.post(
        `${API_URL}/volunteers`,
        {
          email,
          volunteerName: state.user?.name,
          volunteerContact: state.user?.contactno,
          volunteerId: state.user?._id,
        }
      );
      
      // Update the local state with the updated request
      if (response.data.seniorCitizen) {
        set((state) => ({
          products: state.products.map((p) =>
            p._id === response.data.seniorCitizen._id 
              ? response.data.seniorCitizen 
              : p
          ),
        }));
        return response.data.seniorCitizen;
      }
      
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to accept help request' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markHelpCompleted: async (email, completionCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mark-help-completed`, { 
        email, 
        completionCode,
        isAdmin: false
      });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error marking help as completed",
        isLoading: false,
      });
      throw error;
    }
  },

}));
