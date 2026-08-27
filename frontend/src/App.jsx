import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import api from './services/api';
// Public Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SmartDeals from './pages/public/SmartDeals';
import MenusPage from './pages/public/Menus';
import OrderPage from './pages/public/Order';
import Profile from './pages/public/Profile';
import PublicCateringPackages from './pages/public/PublicCateringPackages';
import AboutUs from './pages/public/AboutUs';
import EventBooking from './pages/public/EventBooking';
import Contact from './pages/public/Contact';
import ForgotPassword from './pages/auth/ForgotPassword';
import Chatbot from './components/Chatbot';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/public/NotFound';

// Admin Pages
import AdminLogin from './pages/auth/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import WasteReduction from './pages/admin/WasteReduction';
import Reports from './pages/admin/Reports';
import ProductMenuManagement from './pages/admin/ProductMenuManagement';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import AddMenu from './pages/admin/AddMenu';
import BeveragesManagement from './pages/admin/BeveragesManagement';
import AddBeverage from './pages/admin/AddBeverage';
import CateringPackages from './pages/admin/CateringPackages';
import AddCateringPackage from './pages/admin/AddCateringPackage';
import PremiumAddons from './pages/admin/PremiumAddons';
import CakeDesigns from './pages/admin/CakeDesigns';
import Events from './pages/admin/Events';
import AddEvent from './pages/admin/AddEvent';
import Settings from './pages/admin/Settings';
import Notifications from './pages/admin/Notifications';
import QRCodes from './pages/admin/QRCodes';
import ChatSupport from './pages/admin/ChatSupport';
import InventoryManagement from './pages/admin/InventoryManagement';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffLogin from './pages/auth/StaffLogin';
import AdminSetup from './pages/auth/AdminSetup';

const PrivateRoute = ({ children, roles, loginPath }) => {
    const { user } = useAuthStore();
    
    // Redirect logic
    if (!user) {
        if (loginPath) {
            return <Navigate to={loginPath} />;
        }
        if (roles && (roles.includes('admin') || roles.includes('staff'))) {
            return <Navigate to="/admin/login" />;
        }
        return <Navigate to="/login" />;
    }
    
    if (roles && !roles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin" />;
        }
        if (user.role === 'staff') {
            return <Navigate to="/secure-staff-portal" />;
        }
        return <Navigate to="/" />;
    }
    
    return children;
};

const GlobalSetupCheck = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkSetup = async () => {
            try {
                // Don't check on the setup page itself to prevent loops
                if (location.pathname === '/admin/setup') return;

                const { data } = await api.get('/auth/setup-status');
                if (data.isFirstSetup) {
                    navigate('/admin/setup');
                }
            } catch (error) {
                console.error('Failed to check setup status', error);
            }
        };
        checkSetup();
    }, [navigate, location.pathname]);

    return null;
};

function App() {
    return (
        <Router>
            <GlobalSetupCheck />
            <Toaster position="top-right" />
            <ErrorBoundary>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/smart-deals" element={<SmartDeals />} />
                <Route path="/menus" element={<MenusPage />} />
                <Route path="/order" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/setup" element={<AdminSetup />} />
                <Route path="/secure-staff-portal/login" element={<StaffLogin />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/catering" element={<PublicCateringPackages />} />
                <Route path="/bookings" element={<EventBooking />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <PrivateRoute roles={['admin']}>
                        <AdminLayout />
                    </PrivateRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="users" element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
                    <Route path="products" element={<Navigate to="/admin/menus" replace />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/edit/:id" element={<EditProduct />} />
                    <Route path="menus" element={<ProductMenuManagement />} />
                    <Route path="menus/add" element={<AddMenu />} />
                    <Route path="beverages" element={<BeveragesManagement />} />
                    <Route path="beverages/add" element={<AddBeverage />} />
                    <Route path="catering-packages" element={<CateringPackages />} />
                    <Route path="catering-packages/add" element={<AddCateringPackage />} />
                    <Route path="premium-addons" element={<PremiumAddons />} />
                    <Route path="cake-designs" element={<CakeDesigns />} />
                    <Route path="ai/waste" element={<WasteReduction />} />
                    <Route path="events" element={<Events />} />
                    <Route path="events/add" element={<AddEvent />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="qrcodes" element={<QRCodes />} />
                    <Route path="chat" element={<ChatSupport />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                {/* Staff Routes */}
                <Route path="/secure-staff-portal" element={
                    <PrivateRoute roles={['staff', 'admin']} loginPath="/secure-staff-portal/login">
                        <StaffDashboard />
                    </PrivateRoute>
                } />

                {/* Catch-all 404 Route for Security by Obscurity */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            </ErrorBoundary>
            <Chatbot />
        </Router>
    );
}

export default App;
