import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Helper function to normalize role names
const normalizeRole = (role) => {
  if (!role) return '';
  // Convert to lowercase and remove spaces for comparison
  return role.toLowerCase().replace(/\s+/g, '');
};

export const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth if we don't have a user yet
    if (!user) {
      checkAuth();
    }
    // eslint-disable-next-line
  }, []);

  // If we're still checking auth, show loading
  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If email not verified, redirect to verification page
  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check if user has the required role
  const userRole = normalizeRole(user.category);
  const hasRequiredRole = allowedRoles.some(role => 
    normalizeRole(role) === userRole
  );
  
  // If user doesn't have the required role, redirect to their home page
  if (!hasRequiredRole) {
    const redirectPath = userRole.includes('volunteer') ? '/volunteer-home' : '/citizen-home';
    return <Navigate to={redirectPath} replace />;
  }

  // If all checks pass, render the children
  return children;
};

// Create specific role-protected components for convenience
export const CitizenRoute = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['Senior Citizen', 'Citizen']}>
    {children}
  </RoleProtectedRoute>
);

export const VolunteerRoute = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['Volunteer']}>
    {children}
  </RoleProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['Admin']}>
    {children}
  </RoleProtectedRoute>
);
