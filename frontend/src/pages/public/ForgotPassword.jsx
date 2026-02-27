// ForgotPassword.jsx
// Connected to backend forgot password API

import { useState } from "react"
import api from "../../api/axios"

function ForgotPassword() {

    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setLoading(true)

        try {
            const res = await api.post("/auth/forgot-password", { email })
            setMessage(res.data.message)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Forgot Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                />

                {message && <p className="text-green-600 text-sm">{message}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

            </form>
        </div>
    )
}

export default ForgotPassword
