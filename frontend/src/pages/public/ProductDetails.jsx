// ProductDetails.jsx
// FINAL PROFESSIONAL VERSION – Variants + Cart + Reviews + Interactive Stars + Animated Bars

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../../api/axios"
import StarRating from "../../components/common/StarRating"
import InteractiveStarRating from "../../components/common/InteractiveStarRating"

function ProductDetails() {

    const { id } = useParams()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [selectedSize, setSelectedSize] = useState("")
    const [selectedColor, setSelectedColor] = useState("")
    const [quantity, setQuantity] = useState(1)

    const [message, setMessage] = useState("")

    // ===== Review States =====
    const [reviews, setReviews] = useState([])
    const [ratingSummary, setRatingSummary] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    })

    const [newRating, setNewRating] = useState(5)
    const [newComment, setNewComment] = useState("")

    const [editingReviewId, setEditingReviewId] = useState(null)
    const [editRating, setEditRating] = useState(5)
    const [editComment, setEditComment] = useState("")

    const token = localStorage.getItem("token")
    const currentUserId =
        token ? JSON.parse(atob(token.split(".")[1])).id : null

    // ================= FETCH DATA =================
    useEffect(() => {

        const fetchData = async () => {
            try {

                const productRes = await api.get(`/products/${id}`)
                setProduct(productRes.data)

                const reviewRes = await api.get(`/reviews/product/${id}`)
                setReviews(reviewRes.data)

                const summaryRes = await api.get(`/reviews/product/${id}/summary`)
                setRatingSummary(summaryRes.data)

            } catch {
                setError("Product not found")
            } finally {
                setLoading(false)
            }
        }

        fetchData()

    }, [id])

    if (loading) return <p className="text-center py-20">Loading...</p>
    if (error) return <p className="text-center py-20 text-red-500">{error}</p>

    const uniqueSizes = [...new Set(product.variants.map(v => v.size))]
    const uniqueColors = [...new Set(product.variants.map(v => v.color))]

    const selectedVariant = product.variants.find(
        v => v.size === selectedSize && v.color === selectedColor
    )

    // ================= ADD TO CART =================
    const handleAddToCart = async () => {

        if (!selectedVariant) return alert("Select size and color")
        if (quantity > selectedVariant.stock) return alert("Stock exceeded")

        if (token) {
            await api.post("/cart/add", {
                variantId: selectedVariant.id,
                quantity
            })
            setMessage("Added to cart")
        } else {
            const guestCart =
                JSON.parse(localStorage.getItem("guestCart")) || []

            const existing = guestCart.find(
                item => item.variantId === selectedVariant.id
            )

            if (existing) existing.quantity += quantity
            else guestCart.push({
                variantId: selectedVariant.id,
                quantity
            })

            localStorage.setItem("guestCart", JSON.stringify(guestCart))
            setMessage("Added to cart (Guest)")
        }

        setTimeout(() => setMessage(""), 2000)
    }

    // ================= REVIEW REFRESH =================
    const refreshReviews = async () => {
        const reviewRes = await api.get(`/reviews/product/${id}`)
        setReviews(reviewRes.data)

        const summaryRes = await api.get(`/reviews/product/${id}/summary`)
        setRatingSummary(summaryRes.data)
    }

    const handleAddReview = async () => {
        try {
            await api.post("/reviews", {
                productId: id,
                rating: newRating,
                comment: newComment
            })
            setNewComment("")
            setNewRating(5)
            refreshReviews()
        } catch (err) {
            alert(err.response?.data?.message || "Review failed")
        }
    }

    const handleUpdateReview = async (reviewId) => {
        try {
            await api.put(`/reviews/${reviewId}`, {
                rating: editRating,
                comment: editComment
            })
            setEditingReviewId(null)
            refreshReviews()
        } catch {
            alert("Update failed")
        }
    }

    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/reviews/${reviewId}`)
            refreshReviews()
        } catch {
            alert("Delete failed")
        }
    }

    const userAlreadyReviewed = reviews.some(
        r => r.userId === currentUserId
    )

    // ================= ANIMATED RATING BAR =================
    const renderBar = (star) => {

        const count = ratingSummary.ratingBreakdown?.[star] || 0
        const total = ratingSummary.totalReviews || 1
        const percentage = (count / total) * 100

        return (
            <div key={star} className="flex items-center gap-3 mb-2">

                <span className="w-12 text-sm">{star} star</span>

                <div className="flex-1 bg-gray-200 h-3 rounded overflow-hidden">

                    <div
                        className="bg-yellow-400 h-3 rounded transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                    />

                </div>

                <span className="w-6 text-sm text-right">{count}</span>

            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-20">

            {/* ================= PRODUCT SECTION ================= */}
            <div className="grid md:grid-cols-2 gap-12">

                <div className="bg-white shadow rounded-xl flex items-center justify-center h-[400px]">
                    {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="h-full object-cover" />
                        : "No Image"}
                </div>

                <div>

                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <p className="text-2xl font-semibold mb-4">৳ {product.price}</p>

                    {/* ⭐ Rating Summary */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <StarRating rating={ratingSummary.averageRating} size={22} />
                            <span className="text-lg font-semibold">
                                {ratingSummary.averageRating} / 5
                            </span>
                        </div>
                        <p className="text-gray-500">
                            {ratingSummary.totalReviews} reviews
                        </p>
                    </div>

                    {/* Size */}
                    <div className="mb-4">
                        <p className="font-semibold">Size:</p>
                        {uniqueSizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 border mr-2 ${selectedSize === size ? "bg-black text-white" : ""}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Color */}
                    <div className="mb-4">
                        <p className="font-semibold">Color:</p>
                        {uniqueColors.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 border mr-2 ${selectedColor === color ? "bg-black text-white" : ""}`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>

                    {selectedVariant && (
                        <p className="text-sm mb-4">
                            Stock: {selectedVariant.stock}
                        </p>
                    )}

                    {selectedVariant && (
                        <input
                            type="number"
                            min="1"
                            max={selectedVariant.stock}
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Number(e.target.value))
                            }
                            className="border px-3 py-1 mb-4"
                        />
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedVariant}
                        className="bg-black text-white px-6 py-3 rounded"
                    >
                        Add to Cart
                    </button>

                    {message && (
                        <p className="text-green-600 mt-3">{message}</p>
                    )}

                </div>
            </div>


            {/* ================= REVIEW SECTION ================= */}
            <div className="mt-20">

                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                {/* EMPTY STATE */}
                {ratingSummary.totalReviews === 0 && (
                    <div className="bg-white p-12 rounded-xl shadow text-center mb-10">

                        <div className="text-6xl mb-4">⭐</div>

                        <h3 className="text-xl font-semibold mb-2">
                            No reviews yet
                        </h3>

                        <p className="text-gray-500 mb-4">
                            Be the first to share your experience with this product.
                        </p>

                        {!token && (
                            <p className="text-sm text-gray-400">
                                Please login to write a review.
                            </p>
                        )}
                    </div>
                )}

                {/* ⭐ Distribution Bars (only if reviews exist) */}
                {ratingSummary.totalReviews > 0 && (
                    <div className="bg-white p-6 rounded shadow mb-10">
                        {[5, 4, 3, 2, 1].map(renderBar)}
                    </div>
                )}

                {/* Add Review Form */}
                {token && !userAlreadyReviewed && (
                    <div className="bg-white p-6 rounded shadow mb-10">

                        <div className="mb-4">
                            <InteractiveStarRating
                                value={newRating}
                                onChange={(val) => setNewRating(val)}
                            />
                        </div>

                        <textarea
                            placeholder="Write your review..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border px-4 py-2 rounded mb-4"
                        />

                        <button
                            onClick={handleAddReview}
                            className="bg-black text-white px-6 py-2"
                        >
                            Submit Review
                        </button>
                    </div>
                )}

                {/* Review List */}
                {ratingSummary.totalReviews > 0 && (
                    <div className="space-y-6">
                        {reviews.map(review => {

                            const isOwner = review.userId === currentUserId

                            return (
                                <div key={review.id} className="bg-white p-6 rounded shadow">

                                    <div className="flex justify-between items-center">
                                        <h4>{review.user.name}</h4>
                                        <StarRating rating={review.rating} size={16} />
                                    </div>

                                    <p className="mt-2">{review.comment}</p>

                                    {isOwner && (
                                        <div className="mt-3 text-sm flex gap-4">

                                            <button
                                                onClick={() => {
                                                    setEditingReviewId(review.id)
                                                    setEditComment(review.comment)
                                                    setEditRating(review.rating)
                                                }}
                                                className="text-blue-600"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    )}

                                </div>
                            )
                        })}
                    </div>
                )}

            </div>



        </div>
    )
}

export default ProductDetails
