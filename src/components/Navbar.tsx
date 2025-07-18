import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';



const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('theme') === 'dark';
    if (darkMode) document.documentElement.classList.add('dark');
    setIsDark(darkMode);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const newMode = !html.classList.contains('dark');
    html.classList.toggle('dark');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    setIsDark(newMode);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400 transition"
        >
          Task Manager
        </Link>

        <ul className="flex flex-wrap gap-4 items-center mt-2 md:mt-0">
          <li>
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-300 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/active" className="hover:text-blue-600 dark:hover:text-blue-300 transition">
              Active Tasks
            </Link>
          </li>
          <li>
            <Link to="/completed" className="hover:text-blue-600 dark:hover:text-blue-300 transition">
              Completed
            </Link>
          </li>

          <li>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:opacity-90 transition"
              aria-label="Toggle dark mode"
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </li>

          {!user ? (
            <>
              <li>
                <Link to="/signup" className="hover:text-blue-600 dark:hover:text-blue-300 transition">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-300 transition">
                  Login
                </Link>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition"
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
