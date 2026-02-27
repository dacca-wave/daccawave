// Home.jsx
// Dacca Wave – Home Page with Products + Categories (Backend Connected)

import { useEffect, useState } from "react"
import api from "../../api/axios"
import ProductCard from "../../components/products/ProductCard"
import { useNavigate } from "react-router-dom"



function Home() {

    // ================= STATES =================
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate()



    // ================= FETCH DATA =================
    useEffect(() => {

        // Fetch products
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products")

                // backend returns { success: true, data: [...] }
                setProducts(res.data.data)

            } catch (err) {
                setError("Failed to load products")
            }
        }

        // Fetch categories
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories")

                // handle both formats
                const data = res.data.data || res.data
                setCategories(data)

            } catch (err) {
                console.log("Category load failed")
            }
        }

        const loadData = async () => {
            await fetchProducts()
            await fetchCategories()
            setLoading(false)
        }

        loadData()

    }, [])


    return (
        <div className="space-y-20">

            {/* ================= HERO SECTION ================= */}
            <section className="bg-offwhite py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                            Elevate Your <br />
                            <span className="text-gray-800">Style Game</span>
                        </h1>

                        <p className="text-gray-600 text-lg mb-8">
                            Discover premium fashion crafted for modern confidence.
                            Dacca Wave brings bold elegance to everyday wear.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate("/shop")}
                                className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 transition"
                            >
                                Shop Now
                            </button>

                            <button
                                onClick={() => navigate("/shop")}
                                className="border border-black px-6 py-3 rounded-lg hover:bg-black hover:text-white transition"
                            >
                                Explore Collection
                            </button>

                        </div>
                    </div>

                    {/* Right Image Placeholder */}
                    {/* Right Hero Image */}
                    <div className="relative">

                        {/* Image */}
                        <img
                            src="https://images.unsplash.com/photo-1520975922284-cc8a8b6d6c4e?q=80&w=1200&auto=format&fit=crop"
                            alt="Dacca Wave Fashion"
                            className="rounded-2xl shadow-2xl object-cover h-[450px] w-full"
                        />

                        {/* Soft overlay glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent"></div>

                    </div>


                </div>
            </section>



            {/* ================= FEATURED CATEGORIES ================= */}
            <section className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-10 text-center">
                    Featured Categories
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {!loading && categories.slice(0, 3).map(category => (
                        <div
                            key={category.id}
                            onClick={() => navigate(`/shop?category=${category.name}`)}
                            className="bg-white shadow-md rounded-xl h-40 flex items-center justify-center hover:shadow-xl transition cursor-pointer"
                        >
                            <span className="text-lg font-semibold">
                                {category.name}
                            </span>
                        </div>

                    ))}

                </div>
            </section>



            {/* ================= TRENDING PRODUCTS ================= */}
            <section className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-10 text-center">
                    Trending Products
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Loading */}
                    {loading && (
                        <p className="col-span-4 text-center">
                            Loading products...
                        </p>
                    )}

                    {/* Error */}
                    {error && (
                        <p className="col-span-4 text-center text-red-500">
                            {error}
                        </p>
                    )}

                    {/* High price first */}
                    {!loading && !error && [...products]
                        .sort((a, b) => b.price - a.price)
                        .slice(0, 4)
                        .map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}

                </div>
            </section>



            {/* ================= NEW ARRIVALS ================= */}
            <section className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-10 text-center">
                    New Arrivals
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {!loading && !error && [...products]
                        .sort((a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .slice(0, 4)
                        .map(product => (
                            <ProductCard
                                key={`new-${product.id}`}
                                product={product}
                            />
                        ))}

                </div>
            </section>



            {/* ================= NEWSLETTER ================= */}
            <section className="bg-white py-16 shadow-inner">
                <div className="max-w-3xl mx-auto px-6 text-center">

                    <h2 className="text-3xl font-bold mb-4">
                        Join Our Newsletter
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Get updates about new collections & exclusive offers.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">

                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="border px-4 py-2 rounded-lg w-full md:w-80"
                        />

                        <button className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-80">
                            Subscribe
                        </button>

                    </div>

                </div>
            </section>

        </div>
    )
}

export default Home
