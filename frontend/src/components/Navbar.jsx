import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-black sticky top-0 z-30 border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
            CA
          </div>
          <span className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">Case Analysis</span>
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/cases" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Cases
              </Link>
              <Link to="/cases/new" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Create Case
              </Link>
              <Link to="/case-analysis" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                AI Analysis
              </Link>
              {/* AI Chat removed per new flow */}
              
              <div className="relative ml-4">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:text-purple-400 transition-colors"
                >
                  <span className="hidden sm:inline">{user.email}</span>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                    {user.role}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-2xl bg-gray-900 border border-gray-800">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                      >
                        Your Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-all duration-200"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
                <Link
                  to="/register"
                  className="ml-4 inline-flex items-center px-6 py-2 text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  Sign up
                </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
