import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"

import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

// Stripe public key from frontend .env
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)
