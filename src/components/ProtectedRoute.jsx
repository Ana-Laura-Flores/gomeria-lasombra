function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user, loading} = useAuth();

   if (loading) {
    return <p className="text-center mt-10">Cargando sesión...</p>;
  }
  if (!isLoggedIn) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/ordenes" />;
  }

  return children;
}
