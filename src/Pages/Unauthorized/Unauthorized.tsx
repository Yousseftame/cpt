import { ShieldOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext/AuthContext";
import toast from "react-hot-toast";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      navigate("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6">
            <ShieldOff className="text-white" size={40} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            You don't have permission to access this area. Please contact your
            administrator if you believe this is an error.
          </p>

          {/* Error Code */}
          <div className="inline-block px-4 py-2 bg-red-100 rounded-lg mb-8">
            <span className="text-red-600 font-semibold">Error 403</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;