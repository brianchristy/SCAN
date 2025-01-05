import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, PhoneCall, User, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";
import backgroundImage from "../assets/signup-bg.jpg";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactno, setContactno] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState("");

  const navigate = useNavigate();
  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const skillsToSubmit = category === "Volunteer" ? skills : null;

    try {
      await signup(
        email,
        password,
        name,
        contactno,
        category,
        skillsToSubmit,
        location
      );
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSkills((prev) =>
      prev.includes(value)
        ? prev.filter((skill) => skill !== value)
        : [...prev, value]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
      }}
    >
      <header
        className="w-full p-4 text-white fixed top-0 left-0 flex justify-between items-center z-50 backdrop-blur-lg"
        style={{
          background:
            "linear-gradient(90deg, rgba(30, 64, 175, 0.4) 0%, rgba(59, 130, 246, 0.8) 100%)",
        }}
      >
        <div className="text-xl font-bold">
          <Link to="/">SNRCV</Link>
        </div>
        <nav>
          <ul className="flex space-x-8">
            <Link to="/">
              <li className="hover:text-gray-300 cursor-pointer">Home</li>
            </Link>
            <Link to="/login">
              <li className="hover:text-gray-300 cursor-pointer">Login</li>
            </Link>
            <Link to="/feedback">
              <li className="hover:text-gray-300 cursor-pointer">Feedback</li>
            </Link>
          </ul>
        </nav>
      </header>

      <div
        className="w-full max-w-lg p-8 bg-white bg-opacity-90 rounded-xl shadow-lg mx-4 overflow-y-auto mt-16"
        style={{ maxHeight: "80vh" }}
      >
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-700">
          Create Your Account
        </h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            icon={PhoneCall}
            type="text"
            placeholder="Contact No"
            value={contactno}
            onChange={(e) => setContactno(e.target.value)}
          />

          <div className="relative mb-4">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSkills([]);
                setLocation("");
              }}
              className="w-full pl-10 pr-3 py-2 rounded-lg border text-gray-700"
              required
            >
              <option value="" disabled hidden>
                Category
              </option>
              <option value="Senior Citizen">Senior Citizen</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          {category === "Volunteer" && (
            <>
              <h3 className="text-lg font-semibold mb-2 text-blue-700">
                Skills
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  "Driving",
                  "Cooking",
                  "Housekeeping",
                  "Gardening",
                  "Companionship",
                  "Reading",
                  "Shopping",
                  "Medical Assistance",
                ].map((skill) => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={skill}
                      checked={skills.includes(skill)}
                      onChange={handleSkillChange}
                      className="h-4 w-4"
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
              <div className="mb-4">
                {/* <label htmlFor="location" className="block text-blue-700 mb-2">
                  Location
                </label> */}
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
            </>
          )}

          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
          <PasswordStrengthMeter password={password} />

          <motion.button
            className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="animate-spin mx-auto" size={24} />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <div className="flex justify-center mt-6 space-x-4">
          <Link to={"/login"} className="text-blue-700 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUpPage;
