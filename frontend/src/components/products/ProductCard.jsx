// ProductCard.jsx
// Reusable product card component

import { Link } from "react-router-dom"

function ProductCard({ product }) {

    return (
        <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition">

            {/* Product Image */}
            <div className="h-56 bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full object-cover"
                    />
                ) : (
                    <span className="text-gray-400">
                        No Image
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">

                <h3 className="font-semibold text-lg">
                    {product.name}
                </h3>

                <p className="text-sm text-gray-500">
                    {product.category?.name}
                </p>

                <p className="font-bold text-black">
                    ৳ {product.price}
                </p>

                <Link
                    to={`/product/${product.id}`}
                    className="block text-center bg-black text-white py-2 rounded-lg hover:opacity-80 transition"
                >
                    View Details
                </Link>

            </div>
        </div>
    )
}

export default ProductCard
