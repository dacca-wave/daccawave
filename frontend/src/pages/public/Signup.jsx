// Signup.jsx
// Signup page connected to backend

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"

function Signup() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        contactNumber: "",
        address: "",
        country: ""
    })

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await api.post("/auth/signup", formData)

            // After successful signup → go to OTP verify page
            navigate("/verify", { state: { email: formData.email } })

        } catch (err) {
            setError(err.response?.data?.message || "Signup failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input name="name" placeholder="Full Name" onChange={handleChange}
                    className="w-full border p-2 rounded-lg" required />

                <input name="email" type="email" placeholder="Email"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg" required />

                <input name="password" type="password" placeholder="Password"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg" required />

                <input name="contactNumber" placeholder="Contact Number"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg" required />

                <input name="address" placeholder="Address"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg" required />

                <input name="country" placeholder="Country"
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg" required />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    {loading ? "Creating..." : "Signup"}
                </button>

            </form>

            <p className="text-sm text-center mt-4">
                Already have an account?{" "}
                <span
                    onClick={() => navigate("/login")}
                    className="text-indigo-600 cursor-pointer hover:underline"
                >
                    Login
                </span>
            </p>



        </div>
    )
}

export default Signup
