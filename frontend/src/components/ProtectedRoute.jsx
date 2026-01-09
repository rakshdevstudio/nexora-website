import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = sessionStorage.getItem('admin_token');

    if (!token) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
