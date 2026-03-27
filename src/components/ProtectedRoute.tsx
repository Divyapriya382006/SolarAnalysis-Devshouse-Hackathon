import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user doesn't have the right role, send them home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
