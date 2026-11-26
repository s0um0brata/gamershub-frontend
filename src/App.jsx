import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";

import AdminLogin from "./pages/auth/AdminLogin.jsx";
import AdminGames from "./pages/admin/AdminGames.jsx";
import ProtectedAdminRoute from "./components/common/ProtectedAdminRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AddGame from "./pages/admin/AddGame.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import EditGame from "./pages/admin/EditGame.jsx";
import StoreHome from "./pages/store/StoreHome.jsx";
import GameDetails from "./pages/store/GameDetails.jsx";
import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import Profile from "./pages/store/Profile.jsx";
import Cart from "./components/store/Cart.jsx";
import Payment from "./pages/store/Payment.jsx";
import PaymentSuccess from "./pages/store/PaymentSuccess.jsx";
import PaymentCancel from "./pages/store/PaymentCancel.jsx";
import Categories from "./pages/store/Categories.jsx";
import Store from "./pages/store/Store.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Disable browser's automatic scroll restoration
    window.history.scrollRestoration = "manual";

    // Always start the new page at the top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<StoreHome />} />
        <Route path="/store" element={<Store />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/game/:slug" element={<GameDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/cart/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="games" element={<AdminGames />} />
            <Route path="games/add" element={<AddGame />} />
            <Route path="games/edit/:gameId" element={<EditGame />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
