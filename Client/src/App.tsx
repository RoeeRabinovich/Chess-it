import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home.page";
import Register from "./pages/Register/Register.page";
import Login from "./pages/Login/Login.page";
import { CreateStudy } from "./pages/CreateStudy/CreateStudy.page";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "./components/ui/Toaster";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute/PublicRoute";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
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
            path="/create-study"
            element={
              <ProtectedRoute>
                <CreateStudy />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </Provider>
  );
}
