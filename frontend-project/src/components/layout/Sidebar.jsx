import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Icons removed as per user request

function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Cars', path: '/cars' },
    { name: 'Packages', path: '/packages' },
    { name: 'Services', path: '/services' },
    { name: 'Payments', path: '/payments' },
    { name: 'Reports', path: '/reports' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={toggleMobileMenu}
          className="bg-primary-800 text-white p-2 rounded-instagram-sm shadow-instagram hover:bg-primary-700 focus:outline-none transition-all duration-200 text-sm font-bold"
          aria-label="Open menu"
        >
          MENU
        </button>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-center h-16 bg-gradient-to-r from-primary-800 to-primary-900 shadow-instagram">
        <h1 className="text-xl font-bold text-white">Smart Pack</h1>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
        <div className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-primary-900 to-primary-950 shadow-instagram-hover transform transition-transform duration-300 ease-in-out">
          <div className="flex justify-between items-center p-6 border-b border-primary-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <h2 className="text-xl font-bold text-white">Smart Pack</h2>
            </div>
            <button
              onClick={closeMobileMenu}
              className="text-primary-200 hover:text-white p-1 rounded-instagram-sm transition-colors duration-200 text-sm font-bold"
              aria-label="Close menu"
            >
              X
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-10rem)] py-4">
            <nav className="px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`nav-item ${
                    isActive(item.path) ? 'nav-item-active' : 'nav-item-inactive'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-0 w-full border-t border-primary-700 p-4">
            <div className="flex items-center mb-4 p-3 bg-primary-800 rounded-instagram">
              <div className="profile-pic w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold text-sm">
                U
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-white">{user?.Username || 'User'}</p>
                <p className="text-xs text-primary-200">Car Wash Manager</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-instagram text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-instagram"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-10 lg:shadow-instagram-hover lg:bg-gradient-to-b lg:from-primary-900 lg:to-primary-950">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center flex-shrink-0 px-6 h-20 border-b border-primary-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-instagram flex items-center justify-center shadow-instagram">
                <span className="text-white font-bold text-lg">SP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Smart Pack</h1>
                <p className="text-xs text-primary-200">Car Services</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto py-6">
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-item ${
                    isActive(item.path) ? 'nav-item-active' : 'nav-item-inactive'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="flex-shrink-0 border-t border-primary-700 p-4">
            <div className="flex items-center mb-4 p-4 bg-primary-800 rounded-instagram shadow-instagram-card">
              <div className="profile-pic w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-white">{user?.Username || 'User'}</p>
                <p className="text-xs text-primary-200">Car Wash Manager</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-instagram-sm transition-all duration-200 text-xs font-bold"
                title="Logout"
              >
                OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
