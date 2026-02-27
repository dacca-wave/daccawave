import { Navigate, useLocation } from "react-router-dom"

function ProtectedRoute({ children, allowedRole }) {

    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const isVerified = localStorage.getItem("isVerified") === "true"
    const location = useLocation()

    // ❌ Not logged in
    if (!token) {
        return <Navigate to="/login" />
    }

    // ❌ Role mismatch
    if (allowedRole && role !== allowedRole) {
        return <Navigate to="/" />
    }

    // 🔴 Not verified → only allow /verify
    if (!isVerified) {
        if (location.pathname !== "/verify") {

            // force logout
            localStorage.clear()

            return <Navigate to="/login" />
        }
    }

    return children
}

export default ProtectedRoute
