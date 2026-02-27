// AuthContext.jsx
// Global authentication state manager

import { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"


const AuthContext = createContext()

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true) // 🔥 important

    // Load token from localStorage on refresh
    useEffect(() => {
        const savedToken = localStorage.getItem("token")

        if (savedToken) {
            const decoded = jwtDecode(savedToken)
            setToken(savedToken)
            setUser(decoded)
        }


        setLoading(false) // 🔥 done checking
    }, [])

    const login = (newToken) => {
        localStorage.setItem("token", newToken)

        const decoded = jwtDecode(newToken)

        setToken(newToken)
        setUser(decoded) // 🔥 now user contains id + role
    }


    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
