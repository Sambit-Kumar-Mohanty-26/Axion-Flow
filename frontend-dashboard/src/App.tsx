import { type ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { WorkerLoginPage } from './pages/WorkerLoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { WorkerActivationPage } from './pages/WorkerActivationPage';
import { DashboardPage } from './pages/DashboardPage';
import { FactoriesPage } from './pages/admin/FactoriesPage';
import { UsersPage } from './pages/admin/UsersPage';
import { WorkersPage } from './pages/manager/WorkersPage';
import { SmoothScroll } from './components/layout/SmoothScroll';


const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};


function App() {
  return (
  <SmoothScroll>
    <Router>
      <div className="bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/worker-login" element={<WorkerLoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/join/:factoryId" element={<WorkerActivationPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="factories" element={<FactoriesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="workers" element={<WorkersPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  </SmoothScroll>
  );
}

export default App;