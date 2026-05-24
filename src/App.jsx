import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import AppLayout from './components/layout/AppLayout/AppLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import ManageProjectsPage from './pages/ManageProjectsPage/ManageProjectsPage';
import { USER_ROLES } from './utils/constants';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/projects"
            element={
              <RoleGuard requiredRole={USER_ROLES.TEAM_LEAD}>
                <ManageProjectsPage />
              </RoleGuard>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
