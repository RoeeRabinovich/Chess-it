import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Check localStorage as fallback if user state hasn't been restored yet
  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("user");
  const hasStoredAuth = !!(token && storedUser);

  // Redirect to login if not authenticated
  if (!isAuthenticated && !hasStoredAuth) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    isAdmin = user.isAdmin === true;
  } else if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      isAdmin = parsedUser.isAdmin === true;
    } catch {
      // Invalid JSON, treat as not admin
    }
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
