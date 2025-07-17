import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  user: any;
  children: React.ReactNode;
}

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-4 text-red-600 font-semibold">You must be logged in to view this page.</p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;