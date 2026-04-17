import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    adminOnly?: boolean;
}

export const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to={user.role === 'trainer' ? "/trainer" : "/dashboard"} replace />;
    }

    if (!adminOnly) {
        if (user.role === "admin" && !location.pathname.startsWith("/profile") && !location.pathname.startsWith("/onboarding")) return <Navigate to="/admin" replace />;
        if (user.role === "trainer" && !location.pathname.startsWith("/trainer") && !location.pathname.startsWith("/profile") && !location.pathname.startsWith("/onboarding")) {
            return <Navigate to="/trainer" replace />;
        }
    }

    return <Outlet />;
};
