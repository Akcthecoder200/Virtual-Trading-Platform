import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        <p className="text-gray-400">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
