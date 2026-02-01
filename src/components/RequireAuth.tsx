
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
