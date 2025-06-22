import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
  isAuthenticated: boolean;
  redirectPath: string;
};

export function ProtectedRoute({ 
  children, 
  isAuthenticated, 
  redirectPath 
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the specified path if not authenticated
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
