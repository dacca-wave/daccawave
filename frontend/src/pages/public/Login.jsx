// Login.jsx
// Login page with real backend connection

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"
import { useEffect } from "react"


function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { login, token } = useAuth()


    useEffect(() => {
        if (token) {
            navigate("/")
        }
    }, [token, navigate])



    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await api.post("/auth/login", {
                email,
                password
            })


            // Save token
            localStorage.setItem("token", res.data.token)

            // 🔥 Immediately set token in axios header
            api.defaults.headers.common["Authorization"] =
                `Bearer ${res.data.token}`



            // ===== Guest Cart Merge After Login =====
            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || []

            if (guestCart.length > 0) {

                for (const item of guestCart) {
                    await api.post("/cart/add", {
                        variantId: item.variantId,
                        quantity: item.quantity
                    })
                }

                // clear guest cart after sync
                localStorage.removeItem("guestCart")
            }



            // Save role
            localStorage.setItem("role", res.data.user.role)

            // Save verification status
            localStorage.setItem("isVerified", res.data.user.isVerified)

            // If not verified → force verify page
            if (!res.data.user.isVerified) {
                navigate("/verify", { state: { email } })
            }
            else if (res.data.user.role === "ADMIN") {
                navigate("/admin/dashboard")
            }
            else {
                navigate("/user/dashboard")
            }

        } catch (err) {
            setError(err.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                />

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>


            <p className="text-sm text-center mt-4">
                Don’t have an account?{" "}
                <span
                    onClick={() => navigate("/signup")}
                    className="text-indigo-600 cursor-pointer hover:underline"
                >
                    Create new account
                </span>
            </p>




            <div className="text-center mt-4 text-sm">
                <Link to="/forgot-password" className="text-indigo-600">
                    Forgot Password?
                </Link>
            </div>
        </div>
    )
}

export default Login
