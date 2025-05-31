import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-dark via-olive-medium to-olive-light flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main 404 Card */}
        <div className="bg-white rounded-instagram shadow-instagram p-8 text-center">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-olive-dark mb-2">404</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-olive-medium to-olive-light mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Page Not Found
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Car Wash Themed Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-olive-light to-olive-medium rounded-full flex items-center justify-center">
              <div className="text-white text-4xl font-bold">CW</div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Looks like you took a wrong turn!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {user ? (
              <>
                {/* Authenticated user buttons */}
                <Link
                  to="/"
                  className="w-full bg-gradient-to-r from-olive-medium to-olive-dark text-white py-3 px-6 rounded-instagram font-medium hover:shadow-instagram-hover transform hover:scale-105 transition-all duration-200 inline-block"
                >
                  Go to Dashboard
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/cars"
                    className="bg-olive-light text-olive-dark py-2 px-4 rounded-instagram font-medium hover:bg-olive-medium hover:text-white transition-all duration-200 text-sm"
                  >
                    Manage Cars
                  </Link>
                  <Link
                    to="/services"
                    className="bg-olive-light text-olive-dark py-2 px-4 rounded-instagram font-medium hover:bg-olive-medium hover:text-white transition-all duration-200 text-sm"
                  >
                    Services
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Non-authenticated user buttons */}
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-olive-medium to-olive-dark text-white py-3 px-6 rounded-instagram font-medium hover:shadow-instagram-hover transform hover:scale-105 transition-all duration-200 inline-block"
                >
                  Go to Login
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/register"
                    className="bg-olive-light text-olive-dark py-2 px-4 rounded-instagram font-medium hover:bg-olive-medium hover:text-white transition-all duration-200 text-sm text-center"
                  >
                    Register
                  </Link>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-instagram font-medium hover:bg-gray-200 transition-all duration-200 text-sm"
                  >
                    Go Back
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              Need help? Here are some quick links:
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              {user && (
                <>
                  <Link to="/packages" className="text-olive-medium hover:text-olive-dark transition-colors">
                    Packages
                  </Link>
                  <Link to="/payments" className="text-olive-medium hover:text-olive-dark transition-colors">
                    Payments
                  </Link>
                  <Link to="/reports" className="text-olive-medium hover:text-olive-dark transition-colors">
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white text-sm opacity-80">
            SmartPark Rubavu - Car Wash Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
