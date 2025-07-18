import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  user: { role?: string } | null;
  children: React.ReactNode;
  requiredRole?: string;  // Add this optional prop
}

const ProtectedRoute = ({ user, children, requiredRole }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-4 text-red-600 font-semibold">You do not have permission to view this page.</p>
          {/* Optionally redirect or show message */}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
