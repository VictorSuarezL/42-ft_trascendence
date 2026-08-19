import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export function ProtectedRoute() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
