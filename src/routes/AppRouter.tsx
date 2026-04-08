import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Jobs from '../pages/Jobs';
import JobDetail from '../pages/JobDetail';
import WorkOrder from '../pages/WorkOrder';
import Profile from '../pages/Profile';
import Inventory from '../pages/Inventory';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/jobs"            element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/jobs/:id"        element={<PrivateRoute><JobDetail /></PrivateRoute>} />
        <Route path="/work-orders/:id" element={<PrivateRoute><WorkOrder /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/inventory"       element={<PrivateRoute><Inventory /></PrivateRoute>} />
        <Route path="*"               element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
