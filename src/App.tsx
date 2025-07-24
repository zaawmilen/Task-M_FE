import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

// Pages and Components
import TaskPage from './pages/TaskPage';
import CompletedTasksPage from './pages/CompletedTasksPage';
import ActiveTasksPage from './pages/ActiveTasksPage';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Task } from './types/type';
import api from './utils/api';

interface User {
  _id?: string;
  email?: string;
  username?: string;
  name?: string;
  role?: string;
}
interface UserResponse {
  user: User;
}
export interface TaskResponse {
  tasks: Task[];
  page: number;
  totalPages: number;
}


function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Axios setup and interceptor
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get<UserResponse>('/auth/me');
        setUser(res.data.user);
        await fetchTasks(); // Fetch tasks after setting user
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line
  }, []);

  const fetchTasks = async (
    page: number = currentPage,
    limit: number = 10,
    search: string = searchTerm
  ) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get<TaskResponse>('/tasks', {
        params: { page, limit, search },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTasks(Array.isArray(response.data.tasks) ? response.data.tasks : []);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.page);
    } catch (error) {
      console.error('Error fetching tasks with pagination/search:', error);
    }
  };

  const addTask = async (task: { title: string; dueDate: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      await api.post('/tasks', task, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await fetchTasks(); // Refresh task list after adding
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    try {
      const updatedTask = tasks.find(task => task._id === id);
      if (!updatedTask) return;

      const response = await api.put<Task>(`/tasks/${id}`, {
        completed: !updatedTask.completed,
      });

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === id ? response.data : task
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchTasks(1, 10, term);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTasks(page, 10, searchTerm);
  };

  const handleLogin = async (token: string, userData: User) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    await fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setTasks([]);
  };

  const getUserDisplayName = (): string => {
    if (!user) return '';
    return user.name || user.username || user.email?.split('@')[0] || 'User';
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Navbar */}
        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="font-bold text-xl text-blue-600 mb-2 md:mb-0 hover:text-blue-800 transition">
              Task Manager
            </Link>
            <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
              <li><Link to="/" className="hover:text-blue-600 transition">Home</Link></li>
              <li><Link to="/completed" className="hover:text-blue-600 transition">Completed</Link></li>
              <li><Link to="/active" className="hover:text-blue-600 transition">Active</Link></li>
              {user?.role === 'admin' && (
                <li><Link to="/admin" className="hover:text-blue-600 transition">Admin Panel</Link></li>
              )}
              {!user ? (
                <>
                  <li><Link to="/register" className="hover:text-blue-600 transition">Register</Link></li>
                  <li><Link to="/login" className="hover:text-blue-600 transition">Login</Link></li>
                </>
              ) : (
                <>
                  <li>
                    <span className="font-semibold text-gray-700">Welcome, {getUserDisplayName()}</span>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-6 pb-10 max-w-5xl mx-auto px-4">
          <Routes>
            {/* Home Page (All Tasks) */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <TaskPage
                    tasks={tasks}
                    addTask={addTask}
                    toggleTaskCompletion={toggleTaskCompletion}
                    deleteTask={deleteTask}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    loading={isLoading}
                  />
                </ProtectedRoute>
              }
            />

            {/* Completed Tasks Page */}
            <Route
              path="/completed"
              element={
                <ProtectedRoute user={user}>
                  <CompletedTasksPage
                    tasks={tasks.filter(task => task.completed)}
                    toggleTaskCompletion={toggleTaskCompletion}
                    deleteTask={deleteTask}
                    currentPage={currentPage}
                    // totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    loading={isLoading}
                  />
                </ProtectedRoute>
              }
            />

            {/* Active Tasks Page */}
            <Route
              path="/active"
              element={
                <ProtectedRoute user={user}>
                  <ActiveTasksPage
                    tasks={tasks.filter(task => !task.completed)}
                    toggleTaskCompletion={toggleTaskCompletion}
                    deleteTask={deleteTask}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    loading={isLoading}
                  />
                </ProtectedRoute>
              }
            />

            {/* Login & Register */}
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register />}
            />

            {/* Admin Page */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;