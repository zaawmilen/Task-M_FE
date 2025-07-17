import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskTableProps {
  tasks: Task[];
  filterByStatus?: string;
  filterByUserId?: string;
  onEdit?: (task: Task) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  filterByStatus = 'all',
  filterByUserId,
  onEdit,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>(filterByStatus);

  // Filter tasks by status and user ID (if provided)
  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && task.completed) ||
      (statusFilter === 'active' && !task.completed);

    const userMatch =
      !filterByUserId ||
      (task.user &&
        typeof task.user === 'object' &&
        ('id' in task.user ? task.user.id === filterByUserId : false));

    return statusMatch && userMatch;
  });

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2 font-medium">
          Filter by status:
        </label>
        <select
          id="statusFilter"
          className="border px-2 py-1 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Title</th>
            <th className="py-2 px-4 border-b text-left">Description</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">User</th>
            <th className="py-2 px-4 border-b text-left">Created At</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{task.title}</td>
                <td className="py-2 px-4 border-b">{task.description}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  {typeof task.user === 'object' && task.user && 'name' in task.user
                    ? task.user.name
                    : 'Unknown'}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(task.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(task)}
                      className="text-blue-500 hover:underline focus:outline-none focus:ring focus:ring-blue-400"
                      type="button"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;