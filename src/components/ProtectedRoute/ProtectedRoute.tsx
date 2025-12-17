import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-account" replace />;
  }

  return children;
};

export default ProtectedRoute;
