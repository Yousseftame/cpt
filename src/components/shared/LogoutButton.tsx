import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../store/AuthContext/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully",{
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      navigate("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-800"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
