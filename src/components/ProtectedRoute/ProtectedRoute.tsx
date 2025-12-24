import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext/AuthContext";
import { useEffect, useState } from "react";
import FullScreenLoader from "../shared/FullScreenLoader";
// import { auth } from "../../service/firebase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "superAdmin")[];
}




const ProtectedRoute = ({ children, allowedRoles = ["admin", "superAdmin"] }: ProtectedRouteProps) => {
  const { user, loading, role } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasReloaded, setHasReloaded] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (user && !loading && !hasReloaded) {
        try {
          await user.reload(); // reload مرة واحدة فقط
        } catch (err) {
          console.error("Error reloading user:", err);
        }
        setHasReloaded(true);
      }
      setIsVerifying(false);
    };

    if (!loading) verifyUser();
  }, [user, loading, hasReloaded]);

  if (loading || isVerifying || role === null) {
    return <FullScreenLoader />;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-account" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};


export default ProtectedRoute;