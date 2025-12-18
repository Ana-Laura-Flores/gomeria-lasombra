function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/ordenes" />;
  }

  return children;
}
