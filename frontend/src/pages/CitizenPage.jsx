import { motion } from "framer-motion";
import Input from "../components/Input";
import { HeartPulse, HelpingHandIcon, Loader } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import seniorBackground from "../assets/seniordashboard.jpeg";

const CitizenPage = () => {
  const [helptitle, setHelptitle] = useState("driving");
  const [helpdescription, setHelpdescription] = useState("");
  const [additional, setAdditional] = useState("");
  const [location, setLocation] = useState("");
  const { user, help, markHelpCompleted, isLoading, signout } = useAuthStore();

  const handleHelpReq = async (e) => {
    e.preventDefault();
    try {
      await help(user.email, helptitle, helpdescription, additional, location);
      toast.success("Help request sent");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Error sending help request");
    }
  };

  const handleMarkHelpCompleted = async () => {
    try {
      await markHelpCompleted(user.email);
      toast.success("Help marked as completed");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Error marking help as completed");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${seniorBackground})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Navbar */}
      <header
        className="w-full p-4 text-white fixed top-0 left-0 flex justify-between items-center z-50 backdrop-blur-lg"
        style={{
          background:
            "linear-gradient(90deg, rgba(30, 64, 175, 0.4) 0%, rgba(59, 130, 246, 0.8) 100%)",
        }}
      >
        <Link to="/citizen-home" className="text-white font-bold px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 shadow-lg">
          SCAN
        </Link>
        <button
          onClick={signout}
          className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 shadow-lg ml-auto"
        >
          Sign Out
        </button>
      </header>

      {/* Centered Content */}
      <div className="flex items-center justify-center w-full h-full">
        {user.helpstatus ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-blue-300 bg-opacity-50 backdrop-blur-md p-8 rounded-lg shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">How can we help you?</h2>
            <form onSubmit={handleHelpReq}>
              <div className="mb-4">
                <label
                  htmlFor="subject"
                  className="block text-blue-700 mb-2 font-medium"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  value={helptitle}
                  onChange={(e) => setHelptitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Driving">Driving</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Companionship">Companionship</option>
                  <option value="Reading">Reading</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                </select>
              </div>

              <Input
                icon={HelpingHandIcon}
                type="text"
                placeholder="Description..."
                value={helpdescription}
                onChange={(e) => setHelpdescription(e.target.value)}
              />
              <Input
                icon={HeartPulse}
                type="text"
                placeholder="Time, additional information..."
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
              />
              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-blue-700 mb-2 font-medium"
                >
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your location</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="Kollam">Kollam</option>
                  <option value="Alappuzha">Alappuzha</option>
                  <option value="Pathanamthitta">Pathanamthitta</option>
                  <option value="Kottayam">Kottayam</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Ernakulam">Ernakulam</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Palakkad">Palakkad</option>
                  <option value="Malappuram">Malappuram</option>
                  <option value="Kozhikode">Kozhikode</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Kannur">Kannur</option>
                  <option value="Kasaragod">Kasaragod</option>
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:bg-blue-800"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader className="animate-spin mx-auto" size={24} />
                ) : (
                  "Request Help"
                )}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded-lg shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
              Help Status
            </h2>
            <div className="space-y-4">
              {user.volunteerDetails?.isAccepted ? (
                <>
                  <p className="text-black">A volunteer has accepted your request.</p>
                  <p className="text-black">Volunteer Name: {user.volunteerDetails.name}</p>
                  <p className="text-black">Contact No: {user.volunteerDetails.contactno}</p>
                  <motion.button
                    onClick={handleMarkHelpCompleted}
                    className="mt-4 w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700"
                  >
                    Mark Help as Completed
                  </motion.button>
                </>
              ) : (
                <p className="text-black">
                  Waiting for a volunteer to accept your request...
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CitizenPage;
