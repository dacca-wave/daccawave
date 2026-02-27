import { BrowserRouter, Routes, Route } from "react-router-dom"

import PublicLayout from "../layouts/PublicLayout"
import UserLayout from "../layouts/UserLayout"

import Home from "../pages/public/Home"
import Login from "../pages/public/Login"
import Signup from "../pages/public/Signup"
import VerifyOTP from "../pages/public/VerifyOTP"
import ForgotPassword from "../pages/public/ForgotPassword"
import ResetPassword from "../pages/public/ResetPassword"

import ProtectedRoute from "./ProtectedRoute"
import Dashboard from "../pages/user/Dashboard"

import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/AdminDashboard"

import Shop from "../pages/public/Shop"
import ProductDetails from "../pages/public/ProductDetails"
import Cart from "../pages/public/Cart"
import Checkout from "../pages/public/Checkout"

import Payment from "../pages/public/Payment"
import CheckoutSuccess from "../pages/public/CheckoutSuccess"
import OrderSuccess from "../pages/public/OrderSuccess"



function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ================= PUBLIC ROUTES ================= */}
                <Route element={<PublicLayout />}>

                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />

                    <Route path="/payment" element={<Payment />} />
                    <Route path="/checkout-success" element={<CheckoutSuccess />} />
                    <Route path="/order-success" element={<OrderSuccess />} />



                </Route>

                {/* ================= USER ROUTES ================= */}
                <Route
                    path="/user"
                    element={
                        <ProtectedRoute allowedRole="USER">
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>

                {/* ================= ADMIN ROUTES ================= */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                </Route>

            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
