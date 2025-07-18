import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import UserTable from '../components/UserTable';
import TaskTable from '../components/TaskTable';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types/task';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/admin/users');
      setUsers(res.data.users || res.data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/admin/tasks');
      setAllTasks(res.data.tasks || res.data);
    } catch (err: any) {
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchAllTasks();
    }
    setError(null);
    setIsLoading(activeTab === 'tasks');
  }, [activeTab]);

  if (!user) return <div className="p-6">Loading...</div>;

  if (user && user.role !== 'admin') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // Filtered & paginated tasks
  const filteredTasks = allTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 flex-1 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button
          className={`py-2 px-4 flex-1 ${activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tasks')}
        >
          All Tasks
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <UserTable users={users} refresh={fetchUsers} currentUserId={user._id} />
        )
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-blue-700">All User Tasks</h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded w-full sm:w-1/2"
            />
            <button
              onClick={fetchAllTasks}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              Refresh Tasks
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading tasks...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <>
              <TaskTable tasks={paginatedTasks} onEdit={task => setEditingTask(task)} />

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Edit Task Form */}
          {editingTask && (
            <div className="border mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Edit Task</h3>
              <input
                type="text"
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                className="border px-2 py-1 w-full mb-2"
              />
              <textarea
                value={editingTask.description}
                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                className="border px-2 py-1 w-full mb-2"
              />
              <button
                onClick={async () => {
                  await api.put(`/admin/tasks/${editingTask._id}`, editingTask);
                  fetchAllTasks();
                  setEditingTask(null);
                }}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTask(null)}
                className="ml-2 text-red-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;