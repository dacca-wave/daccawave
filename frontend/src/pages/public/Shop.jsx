// Shop.jsx
// Professional Shop Page with Backend Filtering + Pagination

import { useEffect, useState } from "react"
import api from "../../api/axios"
import ProductCard from "../../components/products/ProductCard"
import FilterSidebar from "../../components/shop/FilterSidebar"
import { useLocation } from "react-router-dom"

function Shop() {

    // ================= LOCATION =================
    const location = useLocation()

    // ================= PRODUCT STATE =================
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // ================= FILTER STATES =================
    const [search, setSearch] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [category, setCategory] = useState("")
    const [size, setSize] = useState("")
    const [color, setColor] = useState("")

    // ================= SORT =================
    const [sortBy, setSortBy] = useState("")

    // ================= PAGINATION =================
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(null)

    // ================= FILTER OPTIONS =================
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        sizes: [],
        colors: []
    })



    // ================= READ CATEGORY FROM URL (IMPORTANT FIX) =================
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const categoryFromURL = params.get("category")

        if (categoryFromURL) {
            setCategory(categoryFromURL)
            setCurrentPage(1) // reset page when URL category changes
        }
    }, [location.search])



    // ================= FETCH PRODUCTS =================
    const fetchProducts = async () => {
        try {

            setLoading(true)

            const res = await api.get("/products", {
                params: {
                    search: search || undefined,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    category: category || undefined,
                    size: size || undefined,
                    color: color || undefined,
                    sort: sortBy || undefined,
                    page: currentPage
                }
            })

            setProducts(res.data.data)
            setPagination(res.data.pagination)

        } catch (err) {
            console.log("Shop load failed")
        } finally {
            setLoading(false)
        }
    }



    // ================= FETCH FILTER OPTIONS =================
    const fetchFilterOptions = async () => {
        try {
            const res = await api.get("/products/filters")
            setFilterOptions(res.data.data)
        } catch (err) {
            console.log("Failed to load filter options")
        }
    }



    // ================= FETCH WHEN FILTER CHANGES =================
    useEffect(() => {
        fetchFilterOptions()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [search, minPrice, maxPrice, category, size, color, sortBy, currentPage])



    // ================= RESET PAGE WHEN FILTER CHANGES =================
    useEffect(() => {
        setCurrentPage(1)
    }, [search, minPrice, maxPrice, category, size, color, sortBy])



    // ================= SCROLL TOP ON PAGE CHANGE =================
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [currentPage])



    return (
        <div className="max-w-7xl mx-auto px-6 py-20">

            <h2 className="text-3xl font-bold mb-10 text-center">
                Shop Collection
            </h2>

            {/* ================= SORT DROPDOWN ================= */}
            <div className="flex justify-end mb-6">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                >
                    <option value="">Sort By</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="newest">Newest</option>
                </select>
            </div>


            <div className="grid md:grid-cols-4 gap-10">

                {/* ================= SIDEBAR ================= */}
                <div className="md:col-span-1">
                    <FilterSidebar
                        search={search}
                        setSearch={setSearch}
                        minPrice={minPrice}
                        setMinPrice={setMinPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        category={category}
                        setCategory={setCategory}
                        size={size}
                        setSize={setSize}
                        color={color}
                        setColor={setColor}
                        filterOptions={filterOptions}
                    />
                </div>


                {/* ================= PRODUCT GRID ================= */}
                <div className="md:col-span-3">

                    {loading ? (
                        <p className="text-center">Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="col-span-3 text-center text-gray-500">
                                    No products found
                                </p>
                            )}
                        </div>
                    )}

                    {/* ================= PAGINATION ================= */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-10 gap-2">

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-40"
                            >
                                Prev
                            </button>

                            {[...Array(pagination.totalPages)].map((_, index) => {
                                const pageNumber = index + 1
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`px-4 py-2 rounded-lg border ${currentPage === pageNumber
                                            ? "bg-black text-white"
                                            : ""
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            })}

                            <button
                                disabled={currentPage === pagination.totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-40"
                            >
                                Next
                            </button>

                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Shop
