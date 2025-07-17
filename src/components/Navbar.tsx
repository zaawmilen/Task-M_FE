import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dark mode state
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="font-bold text-xl text-blue-600 dark:text-blue-300 mb-2 md:mb-0 hover:text-blue-800 dark:hover:text-blue-400 transition">
          Task Manager
        </Link>
        <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
          <li>
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-300 transition">Home</Link>
          </li>
          <li>
            <Link to="/active" className="hover:text-blue-600 dark:hover:text-blue-300 transition">Active Tasks</Link>
          </li>
          <li>
            <Link to="/completed" className="hover:text-blue-600 dark:hover:text-blue-300 transition">Completed</Link>
          </li>
          {/* Dark mode toggle button */}
          <li>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition focus:outline-none focus:ring focus:ring-blue-400"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <>
                  <span role="img" aria-label="moon">🌙</span>
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <span role="img" aria-label="sun">☀️</span>
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          </li>
          {!user ? (
            <>
              <li>
                <Link to="/signup" className="hover:text-blue-600 dark:hover:text-blue-300 transition">Sign Up</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-300 transition">Login</Link>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;