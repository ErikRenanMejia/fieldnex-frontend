import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Jobs from '../pages/Jobs';
import JobDetail from '../pages/JobDetail';
import WorkOrder from '../pages/WorkOrder';
import Profile from '../pages/Profile';
import Inventory from '../pages/Inventory';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminJobs from '../pages/admin/AdminJobs';
import AdminJobForm from '../pages/admin/AdminJobForm';
import AdminJobDetail from '../pages/admin/AdminJobDetail';
import AdminTechnicians from '../pages/admin/AdminTechnicians';
import AdminTechnicianDetail from '../pages/admin/AdminTechnicianDetail';
import AdminCompanies from '../pages/admin/AdminCompanies';
import AdminCompanyDetail from '../pages/admin/AdminCompanyDetail';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminVehicles from '../pages/admin/AdminVehicles';
import AdminReports from '../pages/admin/AdminReports';

// ─── Guards ───────────────────────────────────────────────────────────────────

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const TechnicianRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ─── Router ───────────────────────────────────────────────────────────────────

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Root redirect by role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Technician routes */}
        <Route path="/dashboard"       element={<TechnicianRoute><Dashboard /></TechnicianRoute>} />
        <Route path="/jobs"            element={<TechnicianRoute><Jobs /></TechnicianRoute>} />
        <Route path="/jobs/:id"        element={<TechnicianRoute><JobDetail /></TechnicianRoute>} />
        <Route path="/work-orders/:id" element={<PrivateRoute><WorkOrder /></PrivateRoute>} />
        <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/inventory"       element={<TechnicianRoute><Inventory /></TechnicianRoute>} />

        {/* Admin routes */}
        <Route path="/admin"                         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/jobs"                    element={<AdminRoute><AdminJobs /></AdminRoute>} />
        <Route path="/admin/jobs/new"                element={<AdminRoute><AdminJobForm /></AdminRoute>} />
        <Route path="/admin/jobs/:id"                element={<AdminRoute><AdminJobDetail /></AdminRoute>} />
        <Route path="/admin/jobs/:id/edit"           element={<AdminRoute><AdminJobForm /></AdminRoute>} />
        <Route path="/admin/technicians"             element={<AdminRoute><AdminTechnicians /></AdminRoute>} />
        <Route path="/admin/technicians/:id"         element={<AdminRoute><AdminTechnicianDetail /></AdminRoute>} />
        <Route path="/admin/companies"               element={<AdminRoute><AdminCompanies /></AdminRoute>} />
        <Route path="/admin/companies/:id"           element={<AdminRoute><AdminCompanyDetail /></AdminRoute>} />
        <Route path="/admin/inventory"               element={<AdminRoute><AdminInventory /></AdminRoute>} />
        <Route path="/admin/vehicles"                element={<AdminRoute><AdminVehicles /></AdminRoute>} />
        <Route path="/admin/reports"                 element={<AdminRoute><AdminReports /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default AppRouter;
