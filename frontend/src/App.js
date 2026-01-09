import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import '@/App.css';
import axios from 'axios';

// Lazy-loaded components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const Home = lazy(() => import('./components/Home'));

const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : process.env.REACT_APP_BACKEND_URL;

const API = `${BACKEND_URL}/api`;

function App() {
  const location = useLocation();

  // --- Detect /admin route ---
  // This stays in App because it controls global body class
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }, [location.pathname]);

  // Test API connection
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && BACKEND_URL) {
      axios.get(`${API}/`)
        .then(res => console.log('API Connected:', res.data.message))
        .catch(err => console.error('API Connection Error:', err));
    }
  }, []);

  return (
    <Routes>
      <Route path="/admin" element={
        <Suspense fallback={<div style={{ height: '100vh', background: '#0a0a0a' }}></div>}>
          <AdminLogin apiBaseUrl={API} />
        </Suspense>
      } />

      {/* Protected Admin Routes */}
      <Route element={
        <Suspense fallback={<div style={{ height: '100vh', background: '#0a0a0a' }}></div>}>
          <ProtectedRoute />
        </Suspense>
      }>
        <Route path="/admin/dashboard" element={
          <Suspense fallback={<div style={{ height: '100vh', background: '#0a0a0a' }}></div>}>
            <AdminDashboard apiBaseUrl={API} />
          </Suspense>
        } />
      </Route>

      {/* Catch-all for Home/Landing Page */}
      <Route path="*" element={
        <Suspense fallback={<div style={{ height: '100vh', background: '#050505' }}></div>}>
          <Home apiBaseUrl={API} />
        </Suspense>
      } />
    </Routes>
  );
}

export default App;