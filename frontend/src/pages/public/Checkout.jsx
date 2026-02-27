// Checkout.jsx
// Enterprise Checkout Page (COD + Stripe Online Clean Version)

import { useEffect, useState } from "react"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

function Checkout() {

    const { token } = useAuth()
    const navigate = useNavigate()

    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paymentMethod, setPaymentMethod] = useState("COD")
    const [placingOrder, setPlacingOrder] = useState(false)

    // ================= FETCH CART =================
    useEffect(() => {

        // Not logged in → force login
        if (!token) {
            navigate("/login")
            return
        }

        const fetchCart = async () => {
            try {
                const res = await api.get("/cart")
                setCart(res.data)
            } catch (err) {
                console.log("Checkout cart load failed")
            } finally {
                setLoading(false)
            }
        }

        fetchCart()

    }, [token, navigate])



    // ================= PLACE ORDER =================
    const handlePlaceOrder = async () => {

        try {

            setPlacingOrder(true)

            // ================= COD FLOW =================
            if (paymentMethod === "COD") {

                const res = await api.post("/orders/cod")

                alert("Order placed successfully!")
                const orderId = res.data.orderId
                navigate("/order-success?type=COD")

            }

            // ================= STRIPE ONLINE FLOW =================
            else {

                // Step 1 → Backend create PaymentIntent securely
                const res = await api.post("/payments/intent")

                const { clientSecret } = res.data

                if (!clientSecret) {
                    alert("Payment initialization failed")
                    return
                }

                // Step 2 → Redirect to Stripe Payment Page
                navigate(`/payment?clientSecret=${clientSecret}`)
            }

        } catch (err) {

            alert(err.response?.data?.message || "Order failed")

        } finally {
            setPlacingOrder(false)
        }
    }



    // ================= LOADING =================
    if (loading) {
        return <p className="text-center py-20">Loading...</p>
    }

    // ================= EMPTY CART =================
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="text-center py-20">
                Cart is empty
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-20">

            <h2 className="text-3xl font-bold mb-10 text-center">
                Checkout
            </h2>

            <div className="grid md:grid-cols-2 gap-10">

                {/* ================= ORDER SUMMARY ================= */}
                <div className="bg-white p-6 rounded-xl shadow">

                    <h3 className="text-xl font-semibold mb-6">
                        Order Summary
                    </h3>

                    {cart.items.map(item => (
                        <div
                            key={item.id}
                            className="flex justify-between mb-4"
                        >
                            <div>
                                <p>{item.variant.product.name}</p>
                                <p className="text-sm text-gray-500">
                                    {item.quantity} × ৳ {item.variant.product.price}
                                </p>
                            </div>

                            <p>
                                ৳ {item.quantity * item.variant.product.price}
                            </p>
                        </div>
                    ))}

                    <hr className="my-4" />

                    <div className="space-y-2 text-right">

                        <p>
                            Total: ৳ {cart.totalAmount}
                        </p>

                        {cart.discountAmount > 0 && (
                            <p className="text-green-600">
                                Discount: -৳ {cart.discountAmount}
                            </p>
                        )}

                        <h4 className="text-lg font-bold">
                            Payable: ৳ {cart.payableAmount}
                        </h4>

                    </div>

                </div>



                {/* ================= PAYMENT METHOD ================= */}
                <div className="bg-white p-6 rounded-xl shadow">

                    <h3 className="text-xl font-semibold mb-6">
                        Payment Method
                    </h3>

                    <div className="space-y-4">

                        <label className="flex items-center gap-3">
                            <input
                                type="radio"
                                value="COD"
                                checked={paymentMethod === "COD"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            />
                            Cash on Delivery
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="radio"
                                value="ONLINE"
                                checked={paymentMethod === "ONLINE"}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            />
                            Online Payment (Stripe)
                        </label>

                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                        className="bg-black text-white px-8 py-3 rounded-lg mt-8 w-full"
                    >
                        {placingOrder
                            ? "Processing..."
                            : paymentMethod === "COD"
                                ? "Place Order"
                                : "Proceed to Secure Payment"}
                    </button>

                </div>

            </div>

        </div>
    )
}

export default Checkout
