import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedAdminRoute() {
  const { user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.auth,
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>
          Verifying administrator access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
