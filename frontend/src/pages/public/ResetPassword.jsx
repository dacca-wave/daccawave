// ResetPassword.jsx
// Reset password with token from URL

import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../../api/axios"

function ResetPassword() {

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            const res = await api.post("/auth/reset-password", {
                token,
                newPassword: password
            })

            setMessage(res.data.message)

            // redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login")
            }, 2000)

        } catch (err) {
            setError(err.response?.data?.message || "Reset failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Reset Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                />

                {message && <p className="text-green-600 text-sm">{message}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

            </form>
        </div>
    )
}

export default ResetPassword
