import { Navigate, Route, Routes } from "react-router-dom";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import VolunteerPage from "./pages/VolunteerPage";
import CitizenPage from "./pages/CitizenPage";
import CitizenHome from "./pages/CitizenHome";
import VolunteerHome from "./pages/VolunteerHome";
import CitizenProfile from "./pages/CitizenProfile";
import VolunteerProfile from "./pages/VolunteerProfile";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified && user.category == "Volunteer") {
    return <Navigate to="/volunteer-home" replace />;
  }
  if (isAuthenticated && user.isVerified && user.category == "Senior Citizen") {
    return <Navigate to="/citizen-home" replace />;
  }
  if (isAuthenticated && user.isVerified && !user.category) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
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
          path="/citizens"
          element={
            <ProtectedRoute>
              <CitizenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <VolunteerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen-home"
          element={
            <ProtectedRoute>
              <CitizenHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-home"
          element={
            <ProtectedRoute>
              <VolunteerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen-profile"
          element={
            <ProtectedRoute>
              <CitizenProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-profile"
          element={
            <ProtectedRoute>
              <VolunteerProfile />
            </ProtectedRoute>
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
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        {/* catch all routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
