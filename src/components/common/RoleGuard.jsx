import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleGuard({ requiredRole, children }) {
  const { currentUser } = useAuth();

  if (currentUser?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
