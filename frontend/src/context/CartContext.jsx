// CartContext.jsx
// Global cart state manager

import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/axios"

const CartContext = createContext()

export const CartProvider = ({ children }) => {

    const [cartCount, setCartCount] = useState(0)

    const token = localStorage.getItem("token")

    // =============================
    // Fetch cart count
    // =============================
    const fetchCartCount = async () => {

        if (token) {
            try {
                const res = await api.get("/cart", {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const items = res.data.items || []
                setCartCount(items.length)

            } catch (err) {
                setCartCount(0)
            }

        } else {

            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || []
            setCartCount(guestCart.length)
        }
    }

    useEffect(() => {
        fetchCartCount()
    }, [token])

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
