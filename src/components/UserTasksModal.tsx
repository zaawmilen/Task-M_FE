// components/UserTasksModal.tsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Task } from '../types/type';

interface UserTasksModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserTasksModal: React.FC<UserTasksModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserTasks();
    }
  }, [isOpen, userId]);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<>(`/admin/users/${userId}/tasks`);
      setTasks(res.data);
    } catch (err: any) {
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return task.completed;
    if (statusFilter === 'active') return !task.completed;
    return true;
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{userName}'s Tasks</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring focus:ring-blue-400"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <button
          onClick={fetchUserTasks}
          className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
        >
          Refresh Tasks
        </button>

        <div className="mb-4">
          <label htmlFor="statusFilter" className="mr-2">Filter by status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring focus:ring-blue-400"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Title</th>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{task.title}</td>
                      <td className="py-2 px-4 border-b">{task.description}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTasksModal;