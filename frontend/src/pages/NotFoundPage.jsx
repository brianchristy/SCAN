import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (isAuthenticated) {
      if (user?.category === "Volunteer") {
        navigate("/volunteer-home");
      } else {
        navigate("/citizen-home");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <div className="bg-white/10 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="mb-6 text-indigo-200 text-center max-w-md">
          Sorry, the page you are looking for does not exist or you do not have access to it.
        </p>
        <button
          onClick={handleGoHome}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg transition-colors duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage; 