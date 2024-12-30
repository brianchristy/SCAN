import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import volunteerBackground from "../assets/volunteerdashboard.jpeg"; // Importing the image

const VolunteerPage = () => {
  const { user, vhelp, fetchProducts, products, signout } = useAuthStore();
  const [acceptedRequest, setAcceptedRequest] = useState(null);

  // Fetch relevant help requests and check if there's already an accepted request
  useEffect(() => {
    const initializePage = async () => {
      const fetchedProducts = await fetchProducts();
      
      // Check for any previously accepted request associated with this volunteer
      const alreadyAccepted = fetchedProducts.find(
        (req) => req.volunteerDetails && req.volunteerDetails.name === user.name
      );
      
      if (alreadyAccepted) {
        setAcceptedRequest(alreadyAccepted);
      }
    };

    initializePage();
  }, [fetchProducts, user.name]);

  const handlevhelp = async (helpEmail, request) => {
    try {
      await vhelp({
        email: helpEmail,
        volunteerName: user.name,
        volunteerContact: user.contactno,
      });
      toast.success("Help request acknowledged");
      setAcceptedRequest(request); // Set the accepted request in state
    } catch (error) {
      console.error(error);
      toast.error("Error processing help request");
    }
  };

  const handleSignout = async () => {
    try {
      await signout();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error during signout");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${volunteerBackground})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        width: "100vw",
        height: "100vh",
      }}
    >
      <nav className="bg-blue-600 bg-opacity-80 w-full p-4 flex justify-between items-center fixed top-0 z-50 backdrop-blur-lg">
        <Link
          to="/"
          className="text-white font-bold px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 shadow-lg"
        >
          SNRCV
        </Link>
        <button
          onClick={handleSignout}
          className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 shadow-lg ml-auto"
        >
          Sign Out
        </button>
      </nav>

      <div className="pt-24 flex flex-col items-center">
        {acceptedRequest ? (
          <div className="p-8 bg-green-300 bg-opacity-50 rounded-xl shadow-2xl border m-4">
            <h2 className="text-3xl font-bold mb-6 text-center text-green-700 bg-clip-text">
              Accepted Help Request
            </h2>
            <div className="p-4 bg-white rounded-lg border mb-4">
              <h3 className="text-xl font-semibold text-green-700 mb-3">
                Citizen Details
              </h3>
              <p className="text-black">Name: {acceptedRequest.name}</p>
              <p className="text-black">Help Needed: {acceptedRequest.helptitle}</p>
              <p className="text-black">Contact No: {acceptedRequest.contactno}</p>
              <p className="text-black">Description: {acceptedRequest.helpdescription}</p>
              <p className="text-black">Location: {acceptedRequest.location}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {products && products.length > 0 ? (
              <div className="flex flex-row items-center justify-center space-x-6 flex-wrap">
                {products.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 bg-blue-300 bg-opacity-50 rounded-xl shadow-2xl border m-4"
                  >
                    {request.helptitle ? (
                      <div>
                        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 bg-clip-text">
                          Need Help
                        </h2>
                        <div className="p-4 bg-white rounded-lg border mb-4">
                          <h3 className="text-xl font-semibold text-blue-700 mb-3">
                            Senior Citizen Details
                          </h3>
                          <p className="text-black">Name: {request.name}</p>
                          <p className="text-black">Help: {request.helptitle}</p>
                          <p className="text-black">Contact No: {request.contactno}</p>
                          <p className="text-black">
                            Description: {request.helpdescription}
                          </p>
                          <p className="text-black">Location: {request.location}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlevhelp(request.email, request)}
                          className="w-full py-3 px-4 bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:bg-blue-800"
                        >
                          Help
                        </motion.button>
                      </div>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-black text-xl mt-8">
                No relevant help requests available at the moment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerPage;