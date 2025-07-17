import React, { useState } from 'react';
import { Task } from '../types/task';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';

interface CompletedTasksPageProps {
  tasks: Task[];
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  loading: boolean;
}

const TASKS_PER_PAGE = 5;

const CompletedTasksPage: React.FC<CompletedTasksPageProps> = ({
  tasks,
  toggleTaskCompletion,
  deleteTask,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Local search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  // Filter tasks by search term and completed status
  const filteredTasks = tasks.filter(
    (task) =>
      task.completed &&
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic (local)
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );
  const localTotalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Completed Tasks</h2>
      <div className="mb-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">No completed tasks yet.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {paginatedTasks.map((task) => (
              <li
                key={task._id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <span className="font-semibold line-through text-gray-400 dark:text-gray-500">{task.title}</span>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => toggleTaskCompletion(task._id)}
                    className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
                  >
                    Mark Active
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={localTotalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default CompletedTasksPage;