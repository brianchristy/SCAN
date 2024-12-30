import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/auth"
    : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

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
      // Call the backend API to handle signout, such as removing cookies
      await axios.post(`${API_URL}/logout`);

      // Remove the token and clear user state
      localStorage.removeItem("userToken"); // Clear token from localStorage
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });

      // Optionally, you can redirect the user to the login page after signing out
      window.location.href = "/login"; // Redirect to login page after signout

      console.log("User signed out successfully");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing out",
        isLoading: false,
      });
      console.error("Signout Error:", error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
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
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response.data.message || "Error sending reset password email",
      });
      throw error;
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
  help: async (email, helptitle, helpdescription, additional, location) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/citizens`, {
        email,
        helptitle,
        helpdescription,
        additional,
        location,
      });
      set({
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Error in help",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/volunteers`);
      if (response.data.success) {
        set({ products: response.data.data }); // Set products to the response data
      } else {
        console.error("Fetch Products Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      set({
        error: error.response?.data?.message || "Error fetching products",
      });
    }
  },

  vhelp: async ({ email, volunteerName, volunteerContact }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/volunteers`, {
        email,
        volunteerName,
        volunteerContact,
      });
      set({
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Error in help",
        isLoading: false,
      });
      throw error;
    }
  },

  markHelpCompleted: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mark-help-completed`, { email });
      set({
        message: response.data.message,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error marking help as completed",
        isLoading: false,
      });
      throw error;
    }
  },

}));
