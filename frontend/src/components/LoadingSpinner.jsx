import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 bg-fixed bg-cover bg-center p-4 relative">
			<div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
				<motion.div
					className="w-16 h-16 border-4 border-t-4 border-t-blue-500 border-blue-200 rounded-full shadow-lg"
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				/>
				<span className="mt-6 text-lg text-blue-100 font-semibold tracking-wide drop-shadow-lg animate-pulse">
					Loading...
				</span>
			</div>
		</div>
	);
};

export default LoadingSpinner;
