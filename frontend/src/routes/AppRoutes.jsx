import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout     from '../components/layout/AppLayout';

import Landing       from '../pages/Landing';
import Login         from '../pages/Login';
import Signup        from '../pages/Signup';
import Dashboard     from '../pages/Dashboard';
import Portfolio     from '../pages/Portfolio';
import Watchlist     from '../pages/Watchlist';
import Transactions  from '../pages/Transactions';
import Profile       from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"       element={<Landing />} />
    <Route path="/login"  element={<Login />}   />
    <Route path="/signup" element={<Signup />}  />

    {/* Protected — all wrapped in AppLayout */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard"    element={<Dashboard />}    />
        <Route path="/portfolio"    element={<Portfolio />}    />
        <Route path="/watchlist"   element={<Watchlist />}   />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/profile"     element={<Profile />}     />
      </Route>
    </Route>

    {/* Admin only */}
    <Route element={<ProtectedRoute adminOnly />}>
      <Route element={<AppLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;