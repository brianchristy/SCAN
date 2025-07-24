import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import LoadingSpinner from "./components/LoadingSpinner";
import NotFoundPage from "./pages/NotFoundPage";
import SignupSuccessPage from "./pages/SignupSuccessPage";
import EmailVerifiedSuccessPage from "./pages/EmailVerifiedSuccessPage";
import VolunteerPendingApprovalPage from "./pages/VolunteerPendingApprovalPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import VolunteerPage from "./pages/VolunteerPage";
import CitizenPage from "./pages/CitizenPage";
import CitizenHome from "./pages/CitizenHome";
import VolunteerHome from "./pages/VolunteerHome";
import CitizenProfile from "./pages/CitizenProfile";
import VolunteerProfile from "./pages/VolunteerProfile";
import AdminPanel from "./pages/AdminPanel";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import { CitizenRoute, VolunteerRoute, RoleProtectedRoute, AdminRoute } from "./components/RoleProtectedRoute";

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  // If we're still checking auth, show loading
  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user && user.isVerified && user.category) {
    if (user.category === "Admin") {
      return <Navigate to="/admin" replace />;
    } else if (user.category === "Volunteer") {
      return <Navigate to="/volunteer-home" replace />;
    } else if (user.category === "Citizen") {
      return <Navigate to="/citizen-home" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated && user && user.category ? (
              user.category === "Volunteer" ? (
                <Navigate to="/volunteer-home" replace />
              ) : (
                <Navigate to="/citizen-home" replace />
              )
            ) : (
              <HomePage />
            )
          } 
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } 
        />
        {/* Citizen Routes */}
        <Route
          path="/citizens"
          element={
            <CitizenRoute>
              <CitizenPage />
            </CitizenRoute>
          }
        />
        <Route
          path="/citizen-home"
          element={
            <CitizenRoute>
              <CitizenHome />
            </CitizenRoute>
          }
        />
        <Route
          path="/citizen-profile"
          element={
            <CitizenRoute>
              <CitizenProfile />
            </CitizenRoute>
          }
        />
        
        {/* Volunteer Routes */}
        <Route
          path="/volunteers"
          element={
            <VolunteerRoute>
              <VolunteerPage />
            </VolunteerRoute>
          }
        />
        <Route
          path="/volunteer-home"
          element={
            <VolunteerRoute>
              <VolunteerHome />
            </VolunteerRoute>
          }
        />
        <Route
          path="/volunteer-profile"
          element={
            <VolunteerRoute>
              <VolunteerProfile />
            </VolunteerRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/signup-success" element={<SignupSuccessPage />} />
        <Route path="/volunteer-pending-approval" element={<VolunteerPendingApprovalPage />} />
        <Route path="/email-verified-success" element={<EmailVerifiedSuccessPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        {/* catch all routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
