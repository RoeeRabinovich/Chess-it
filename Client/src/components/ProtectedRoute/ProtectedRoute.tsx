import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

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

  return <>{children}</>;
};
