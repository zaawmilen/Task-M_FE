// useTasks.ts
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Task } from '../types/task';
import { useAuth } from '../context/AuthContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchTasks = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', {
        params: { page, limit, search },
      });
      setTasks(res.data.tasks);
      setCurrentPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: { title: string; dueDate: string }) => {
    try {
      const res = await api.post('/tasks', task);
      setTasks((prev) => [...prev, res.data]);
    } catch (err: any) {
      console.error('Add task error:', err.message);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err: any) {
      console.error('Delete task error:', err.message);
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    try {
      const res = await api.put(`/tasks/${id}`, {
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? res.data : t))
      );
    } catch (err: any) {
      console.error('Toggle completion error:', err.message);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, authLoading]);

  return {
    tasks,
    loading,
    error,
    totalPages,
    currentPage,
    fetchTasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
  };
};

export default useTasks;
