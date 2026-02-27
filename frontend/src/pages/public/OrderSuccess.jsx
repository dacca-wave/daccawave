// OrderSuccess.jsx
// Professional Minimal Success Page (COD + Online)

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"

function OrderSuccess() {

    const location = useLocation()
    const navigate = useNavigate()

    const params = new URLSearchParams(location.search)
    const type = params.get("type")

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const isOnline = type === "ONLINE"

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

            <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center">

                {/* Icon */}
                <div className="text-6xl mb-6">
                    {isOnline ? "🎉" : "✅"}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-4">
                    {isOnline
                        ? "Payment Successful!"
                        : "Order Confirmed!"
                    }
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {isOnline
                        ? "Your payment has been successfully completed. A confirmation email with your invoice has been sent to your registered email address."
                        : "Your order has been successfully placed with Cash on Delivery. Please keep the payable amount ready at the time of delivery."
                    }
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">

                    <button
                        onClick={() => navigate("/shop")}
                        className="bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
                    >
                        Continue Shopping
                    </button>

                    <button
                        onClick={() => navigate("/user/dashboard")}
                        className="border border-black py-3 rounded-xl hover:bg-black hover:text-white transition"
                    >
                        Go to Dashboard
                    </button>

                </div>

            </div>

        </div>
    )
}

export default OrderSuccess
