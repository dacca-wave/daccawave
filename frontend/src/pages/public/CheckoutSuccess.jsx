// CheckoutSuccess.jsx
// Professional Payment Success Page

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "../../api/axios"

function CheckoutSuccess() {

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [orderInfo, setOrderInfo] = useState(null)

    const paymentIntent = searchParams.get("payment_intent")

    useEffect(() => {

        const fetchOrder = async () => {
            try {

                // Optional: Later we can fetch by paymentIntent
                // For now just load latest order

                const res = await api.get("/orders/my-latest")

                setOrderInfo(res.data)

            } catch (err) {
                console.log("Failed to load order info")
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()

    }, [])

    if (loading) {
        return <p className="text-center py-20">Verifying payment...</p>
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">

            {/* Success Icon */}
            <div className="text-green-600 text-6xl mb-6">
                ✓
            </div>

            <h1 className="text-3xl font-bold mb-4">
                Payment Successful 🎉
            </h1>

            <p className="text-gray-600 mb-10">
                Thank you for shopping with Dacca Wave.
                Your order has been confirmed.
                A confirmation email has been sent.
            </p>

            {orderInfo && (
                <div className="bg-white shadow rounded-xl p-6 text-left mb-10">

                    <h3 className="text-lg font-semibold mb-4">
                        Order Details
                    </h3>

                    <p><strong>Order ID:</strong> #{orderInfo.id}</p>
                    <p><strong>Total Paid:</strong> ৳ {orderInfo.payableAmount}</p>
                    <p><strong>Payment Method:</strong> {orderInfo.paymentMethod}</p>
                    <p><strong>Status:</strong> {orderInfo.status}</p>

                </div>
            )}

            <div className="flex justify-center gap-6">

                <button
                    onClick={() => navigate("/user/orders")}
                    className="bg-black text-white px-6 py-3 rounded-lg"
                >
                    View My Orders
                </button>

                <button
                    onClick={() => navigate("/shop")}
                    className="border px-6 py-3 rounded-lg"
                >
                    Continue Shopping
                </button>

            </div>

        </div>
    )
}

export default CheckoutSuccess
