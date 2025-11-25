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
    <header className="card-glass sticky top-0 z-30 border-b border-border-color">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 accent-gradient rounded-full flex items-center justify-center text-white font-bold animate-float accent-glow">
            CA
          </div>
          <span className="font-semibold text-lg text-text-primary group-hover:text-accent-3 transition-colors">Case Analysis</span>
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-text-secondary hover:text-accent-3 transition-colors">
                Dashboard
              </Link>
              <Link to="/cases" className="text-sm text-text-secondary hover:text-accent-3 transition-colors">
                Cases
              </Link>
              <Link to="/cases/new" className="text-sm text-text-secondary hover:text-accent-3 transition-colors">
                Create Case
              </Link>
              <Link to="/case-analysis" className="text-sm text-text-secondary hover:text-accent-3 transition-colors">
                AI Analysis
              </Link>
              {/* AI Chat removed per new flow */}
              
              <div className="relative ml-4">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-primary hover:text-accent-3 transition-colors"
                >
                  <span className="hidden sm:inline">{user.email}</span>
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded accent-gradient">
                    {user.role}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg card-glass">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all duration-200"
                      >
                        Your Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all duration-200"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all duration-200"
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
                className="text-sm font-medium text-accent-3 hover:text-accent-1 transition-colors"
              >
                Sign in
              </Link>
                <Link
                  to="/register"
                  className="ml-4 inline-flex items-center px-4 py-2 text-sm leading-4 font-medium rounded-md text-white accent-gradient hover:opacity-90 transition-all duration-300 accent-glow"
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
