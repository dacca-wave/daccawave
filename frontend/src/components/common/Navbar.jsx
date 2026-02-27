// Navbar.jsx
// Top navigation bar with auth-aware logic + cart badge

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { ShoppingCart } from "lucide-react"

function Navbar() {

    const { token } = useAuth()        // logged-in check
    const { cartCount } = useCart()   // global cart count
    const location = useLocation()

    // check if current page is login or signup
    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/signup"

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-gray-800">
                    Dacca Wave
                </Link>

                {/* Right side menu */}
                <div className="flex items-center gap-6 text-gray-600">

                    {/* Home */}
                    <Link to="/" className="hover:text-indigo-600">
                        Home
                    </Link>

                    {/* Shop */}
                    <Link to="/shop" className="hover:text-indigo-600">
                        Shop
                    </Link>

                    {/* Cart (hide on login/signup page) */}
                    {!isAuthPage && (
                        <Link
                            to="/cart"
                            className="relative hover:text-indigo-600"
                        >
                            <ShoppingCart size={22} />

                            {/* Cart badge */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Login button (only if not logged in and not on auth page) */}
                    {!token && !isAuthPage && (
                        <Link
                            to="/login"
                            className="hover:text-indigo-600"
                        >
                            Login
                        </Link>
                    )}

                    {/* Optional: Profile link when logged in */}
                    {token && (
                        <Link
                            to="/profile"
                            className="hover:text-indigo-600"
                        >
                            Profile
                        </Link>
                    )}

                </div>

            </div>
        </nav>
    )
}

export default Navbar
