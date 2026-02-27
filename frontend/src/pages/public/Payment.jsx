// Payment.jsx
// Stripe Secure Payment Page (Production Ready)

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js"

import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"

// 🔐 Load Stripe with Public Key
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLIC_KEY
)



// ================= PAYMENT FORM =================
function PaymentForm() {

    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const { token } = useAuth()

    const [processing, setProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setProcessing(true)
        setErrorMessage("")

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/checkout-success"
            }
        })

        if (error) {
            setErrorMessage(error.message)
            setProcessing(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <PaymentElement />

            {errorMessage && (
                <p className="text-red-500 text-sm">
                    {errorMessage}
                </p>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="bg-black text-white px-8 py-3 rounded-lg w-full"
            >
                {processing ? "Processing..." : "Pay Now"}
            </button>

        </form>
    )
}



// ================= MAIN PAGE =================
function Payment() {

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { token } = useAuth()

    const clientSecret = searchParams.get("clientSecret")

    const [options, setOptions] = useState(null)

    useEffect(() => {

        if (!token) {
            navigate("/login")
            return
        }

        if (!clientSecret) {
            navigate("/checkout")
            return
        }

        setOptions({
            clientSecret,
            appearance: {
                theme: "stripe"
            }
        })

    }, [clientSecret, token, navigate])

    if (!options) {
        return <p className="text-center py-20">Loading payment...</p>
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-20">

            <h2 className="text-3xl font-bold mb-10 text-center">
                Secure Payment
            </h2>

            <div className="bg-white p-8 rounded-xl shadow">

                <Elements stripe={stripePromise} options={options}>
                    <PaymentForm />
                </Elements>

            </div>

        </div>
    )
}

export default Payment
