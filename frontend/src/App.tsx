import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { authService } from './services/authService';

// Layout
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Character from './pages/Character';
import Expedition from './pages/Expedition';
import Cards from './pages/Cards';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ToastContainer from './components/shared/ToastContainer';

function App() {
  const { isAuthenticated, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = useAuthStore.getState().token;
      if (token) {
        try {
          setLoading(true);
          const user = await authService.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          useAuthStore.getState().logout();
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
          />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/character" element={<Character />} />
          <Route path="/expedition" element={<Expedition />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
