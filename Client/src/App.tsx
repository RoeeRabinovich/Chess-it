import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home.page";
import { HomeExplore } from "./pages/HomeExplore/HomeExplore.page";
import Register from "./pages/Register/Register.page";
import Login from "./pages/Login/Login.page";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.page";
import ResetPassword from "./pages/ResetPassword/ResetPassword.page";
import { CreateStudy } from "./pages/CreateStudy/CreateStudy.page";
import { ReviewStudy } from "./pages/ReviewStudy/ReviewStudy.page";
import { Puzzles } from "./pages/Puzzles/Puzzles.page";
import { Profile } from "./pages/Profile/Profile.page";
import { MyStudies } from "./pages/MyStudies/MyStudies.page";
import About from "./pages/About/About.page";
import { DataTableDemo } from "./pages/DataTableDemo/DataTableDemo.page";
import { AdminLayout } from "./pages/Admin/layouts/AdminLayout";
import { AdminDashboard } from "./pages/Admin/Dashboard/Dashboard.page";
import { AdminUsers } from "./pages/Admin/Users/Users.page";
import { AdminStudies } from "./pages/Admin/Studies/Studies.page";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "./components/ui/Toaster";
import { ProtectedRoute } from "./components/RouteGuard/ProtectedRoute";
import { AdminRoute } from "./components/RouteGuard/AdminRoute";
import { PublicRoute } from "./components/RouteGuard/PublicRoute";
import { useAuth } from "./hooks/useAuth";

// Component to conditionally render Home or HomeExplore
const HomeRoute = () => {
  const { user } = useAuth();
  return user ? <HomeExplore /> : <Home />;
};

// Component to conditionally render Footer
const ConditionalFooter = () => {
  const location = useLocation();
  const hideFooterPaths = ["/puzzles", "/create-study"];

  // Hide footer on specific paths or review study pages (dynamic route)
  if (
    hideFooterPaths.includes(location.pathname) ||
    location.pathname.startsWith("/studies/")
  ) {
    return null;
  }

  return <Footer />;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<HomeRoute />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/create-study"
          element={
            <ProtectedRoute>
              <CreateStudy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/puzzles"
          element={
            <ProtectedRoute>
              <Puzzles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-studies"
          element={
            <ProtectedRoute>
              <MyStudies />
            </ProtectedRoute>
          }
        />

        <Route path="/studies/:id" element={<ReviewStudy />} />
        <Route path="/about" element={<About />} />
        <Route path="/datatable-demo" element={<DataTableDemo />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="studies" element={<AdminStudies />} />
        </Route>
      </Routes>
      <ConditionalFooter />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
