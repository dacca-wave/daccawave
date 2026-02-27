// Cart.jsx
// Full Enterprise Cart Page (Guest + Logged-in + Coupon + Remove)

import { useEffect, useState } from "react"
import api from "../../api/axios"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useNavigate } from "react-router-dom"

function Cart() {

    const { token } = useAuth()
    const { refreshCartCount } = useCart()
    const navigate = useNavigate()

    const [cartItems, setCartItems] = useState([])
    const [cartMeta, setCartMeta] = useState(null)
    const [loading, setLoading] = useState(true)

    const [couponCode, setCouponCode] = useState("")
    const [couponMessage, setCouponMessage] = useState("")

    // ================= FETCH CART =================
    const fetchCart = async () => {

        try {

            // ---------- Logged In Cart ----------
            if (token) {

                const res = await api.get("/cart")
                setCartItems(res.data.items)
                setCartMeta(res.data)

            } else {

                // ---------- Guest Cart ----------
                const guestCart =
                    JSON.parse(localStorage.getItem("guestCart")) || []

                if (guestCart.length === 0) {
                    setCartItems([])
                    setCartMeta(null)
                    return
                }

                // fetch variant details
                const detailedItems = await Promise.all(
                    guestCart.map(async (item) => {
                        const res = await api.get(`/products`)
                        const product = res.data.data.find(p =>
                            p.variants.some(v => v.id === item.variantId)
                        )

                        const variant = product?.variants.find(
                            v => v.id === item.variantId
                        )

                        return {
                            id: item.variantId,
                            quantity: item.quantity,
                            variant: {
                                ...variant,
                                product
                            }
                        }
                    })
                )

                setCartItems(detailedItems)
                setCartMeta(null)
            }

        } catch (err) {
            console.log("Cart fetch failed")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCart()
    }, [token])



    // ================= UPDATE QUANTITY =================
    const updateQuantity = async (id, newQty) => {

        if (newQty < 1) return

        try {

            if (token) {

                await api.put(`/cart/${id}`, {
                    quantity: newQty
                })

                fetchCart()
                refreshCartCount()

            } else {

                let guestCart =
                    JSON.parse(localStorage.getItem("guestCart")) || []

                guestCart = guestCart.map(item =>
                    item.variantId === id
                        ? { ...item, quantity: newQty }
                        : item
                )

                localStorage.setItem(
                    "guestCart",
                    JSON.stringify(guestCart)
                )

                fetchCart()
                refreshCartCount()
            }

        } catch (err) {
            console.log("Quantity update failed")
        }
    }



    // ================= REMOVE ITEM =================
    const removeItem = async (id) => {

        try {

            if (token) {

                await api.delete(`/cart/${id}`)
                fetchCart()
                refreshCartCount()

            } else {

                let guestCart =
                    JSON.parse(localStorage.getItem("guestCart")) || []

                guestCart = guestCart.filter(
                    item => item.variantId !== id
                )

                localStorage.setItem(
                    "guestCart",
                    JSON.stringify(guestCart)
                )

                fetchCart()
                refreshCartCount()
            }

        } catch (err) {
            console.log("Remove failed")
        }
    }



    // ================= APPLY COUPON =================
    const handleApplyCoupon = async () => {
        try {

            const res = await api.post("/cart/apply-coupon", {
                code: couponCode
            })

            setCouponMessage(res.data.message)
            fetchCart()

        } catch (err) {
            setCouponMessage(
                err.response?.data?.message || "Invalid coupon"
            )
        }
    }



    // ================= REMOVE COUPON =================
    const handleRemoveCoupon = async () => {
        try {

            await api.delete("/cart/remove-coupon")

            setCouponCode("")
            setCouponMessage("Coupon removed")

            fetchCart()

        } catch (err) {
            console.log("Coupon remove failed")
        }
    }



    // ================= CALCULATE GUEST TOTAL =================
    const guestTotal = cartItems.reduce(
        (acc, item) =>
            acc +
            item.quantity *
            item.variant.product.price,
        0
    )



    // ================= CHECKOUT =================
    const handleCheckout = () => {

        if (!token) {
            navigate("/login")
            return
        }

        navigate("/checkout")
    }



    // ================= UI =================
    if (loading) {
        return <p className="text-center py-20">Loading...</p>
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                Your cart is empty
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-20">

            <h2 className="text-3xl font-bold mb-10 text-center">
                Your Cart
            </h2>

            {/* ========== ITEMS ========== */}
            {cartItems.map(item => (
                <div
                    key={item.id}
                    className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between items-center"
                >

                    <div>
                        <h3 className="font-semibold">
                            {item.variant.product.name}
                        </h3>

                        <p className="text-gray-500">
                            Size: {item.variant.size} | Color: {item.variant.color}
                        </p>

                        <p>
                            ৳ {item.variant.product.price}
                        </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                updateQuantity(
                                    token ? item.id : item.variant.id,
                                    item.quantity - 1
                                )
                            }
                            className="px-3 py-1 border rounded"
                        >
                            -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                            onClick={() =>
                                updateQuantity(
                                    token ? item.id : item.variant.id,
                                    item.quantity + 1
                                )
                            }
                            className="px-3 py-1 border rounded"
                        >
                            +
                        </button>
                    </div>

                    {/* Remove */}
                    <button
                        onClick={() =>
                            removeItem(
                                token ? item.id : item.variant.id
                            )
                        }
                        className="text-red-500"
                    >
                        Remove
                    </button>

                </div>
            ))}

            {/* ========== COUPON SECTION (Logged in only) ========== */}
            {token && cartMeta && (
                <div className="bg-white p-6 rounded-xl shadow mt-10">

                    {!cartMeta.couponCode ? (
                        <>
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) =>
                                    setCouponCode(e.target.value)
                                }
                                className="border px-4 py-2 rounded-lg mr-4"
                            />

                            <button
                                onClick={handleApplyCoupon}
                                className="bg-black text-white px-6 py-2 rounded-lg"
                            >
                                Apply
                            </button>
                        </>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                                <p>
                                    Coupon: {cartMeta.couponCode}
                                </p>
                                <p className="text-green-600">
                                    Discount: -৳
                                    {cartMeta.discountAmount}
                                </p>
                            </div>

                            <button
                                onClick={handleRemoveCoupon}
                                className="text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========== TOTAL ========== */}
            <div className="text-right mt-10 space-y-2">

                {token ? (
                    <>
                        <p>Total: ৳ {cartMeta.totalAmount}</p>

                        {cartMeta.discountAmount > 0 && (
                            <p className="text-green-600">
                                Discount: -৳
                                {cartMeta.discountAmount}
                            </p>
                        )}

                        <h3 className="text-xl font-bold">
                            Payable: ৳
                            {cartMeta.payableAmount}
                        </h3>
                    </>
                ) : (
                    <h3 className="text-xl font-bold">
                        Total: ৳ {guestTotal}
                    </h3>
                )}

                <button
                    onClick={handleCheckout}
                    className="bg-black text-white px-8 py-3 rounded-lg mt-4"
                >
                    Proceed to Checkout
                </button>

            </div>

        </div>
    )
}

export default Cart
