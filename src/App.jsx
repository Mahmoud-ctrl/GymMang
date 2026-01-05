import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Index from "./pages/Index";
import Navigation from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Signup";
import AdminLogin from "./pages/admin/AdminLogin";
import CheckoutPage from "./pages/checkout/Checkout";
import CheckoutSuccessPage from "./pages/checkout/CheckoutSuccess";
import ProductShopPage from "./pages/member/Products";
import EquipmentPage from "./pages/member/Equipments";
import TrainerWaitingPage from "./pages/WaitingPage";

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function ProtectedTrainerRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        if (user.role === 'Trainer' && !user.is_active) {
          navigate('/trainer/waiting', { 
            replace: true,
            state: { message: 'Please complete your trainer profile to access the dashboard' }
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      const protectedRoutes = ['/dashboard', '/admin/dashboard', '/member/dashboard', '/trainer/dashboard'];
      const isProtectedRoute = protectedRoutes.some(route => location.pathname.includes(route));
      
      if (isProtectedRoute) {
        navigate('/login', { replace: true, state: { message: 'Session expired. Please login again.' } });
      }
    }
  }, [location.pathname, navigate]);
  
  const noLayoutRoutes = ['/login', '/signup', '/pu/admin/login', '/checkout', '/checkout/success', '/trainer/waiting'];
  const isDashboardRoute = location.pathname.includes('/dashboard');
  
  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname) && !isDashboardRoute;

  return (
    <>
      {shouldShowLayout && <Navigation />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="pu/admin/login" element={<AdminLogin />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/products" element={<ProductShopPage />} />
        <Route path="/equipments" element={<EquipmentPage />} />
        <Route path="/trainer/waiting" element={<TrainerWaitingPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard/:tab" element={<Dashboard />} />
        <Route path="/member/dashboard" element={<Dashboard />} />
        <Route path="/member/dashboard/:tab" element={<Dashboard />} />
        
        {/* Protected Trainer Routes */}
        <Route 
          path="/trainer/dashboard" 
          element={
            <ProtectedTrainerRoute>
              <Dashboard />
            </ProtectedTrainerRoute>
          } 
        />
        <Route 
          path="/trainer/dashboard/:tab" 
          element={
            <ProtectedTrainerRoute>
              <Dashboard />
            </ProtectedTrainerRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {shouldShowLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;