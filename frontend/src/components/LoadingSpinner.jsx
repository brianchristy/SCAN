import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 bg-fixed bg-cover bg-center p-4 relative">
			<div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
				<motion.div
					className="w-16 h-16 rounded-full border-4 border-t-4 border-t-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent shadow-lg"
					style={{
						borderTop: '4px solid',
						borderImage: 'linear-gradient(to right, #3b82f6, #6366f1, #a21caf) 1',
					}}
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				/>
				<span className="mt-6 text-lg font-semibold tracking-wide drop-shadow-lg animate-pulse bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
					Loading...
				</span>
			</div>
		</div>
	);
};

export default LoadingSpinner;
