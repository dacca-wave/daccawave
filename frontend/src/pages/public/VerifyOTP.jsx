// VerifyOTP.jsx
// OTP verification + resend timer

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../../api/axios"

function VerifyOTP() {

    const navigate = useNavigate()
    const location = useLocation()

    const email = location.state?.email || ""

    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const [countdown, setCountdown] = useState(0)
    const [resendLoading, setResendLoading] = useState(false)

    // Countdown effect
    useEffect(() => {
        if (countdown <= 0) return

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await api.post("/auth/verify-otp", {
                email,
                otp
            })

            navigate("/login")

        } catch (err) {
            setError(err.response?.data?.message || "Verification failed")
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {

        if (!email) return

        setResendLoading(true)
        setError("")

        try {
            const res = await api.post("/auth/resend-otp", { email })

            if (res.data.nextResendAt) {
                const nextTime = new Date(res.data.nextResendAt).getTime()
                const now = Date.now()
                const seconds = Math.floor((nextTime - now) / 1000)

                setCountdown(seconds > 0 ? seconds : 0)
            }

        } catch (err) {
            if (err.response?.data?.remainingSeconds) {
                setCountdown(err.response.data.remainingSeconds)
            } else {
                setError(err.response?.data?.message || "Resend failed")
            }
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Verify Your Email
            </h2>

            <p className="text-sm text-gray-500 mb-4 text-center">
                OTP sent to: <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="text"
                    placeholder="Enter 6 digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    {loading ? "Verifying..." : "Verify"}
                </button>

            </form>

            {/* Resend Section */}
            <div className="text-center mt-4 text-sm">

                {countdown > 0 ? (
                    <p className="text-gray-500">
                        Resend OTP in {countdown}s
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-indigo-600 hover:underline"
                    >
                        {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                )}

            </div>

        </div>
    )
}

export default VerifyOTP
