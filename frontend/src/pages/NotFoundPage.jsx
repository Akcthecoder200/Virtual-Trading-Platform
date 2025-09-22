import { Link } from "react-router-dom";
import { TrendingUp, Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-700">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <Link
            to="/dashboard"
            className="border border-gray-600 hover:border-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
