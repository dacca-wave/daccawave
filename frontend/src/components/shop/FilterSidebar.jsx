// FilterSidebar.jsx
// Sidebar filter UI (connected to Shop state)

function FilterSidebar({
    search,
    setSearch,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    category,
    setCategory,
    size,
    setSize,
    color,
    setColor,
    filterOptions
}) {



    return (
        <div className="bg-white shadow-md rounded-xl p-6 space-y-6">

            <h3 className="text-xl font-semibold">
                Filters
            </h3>

            {/* Search */}
            <div>
                <label className="block mb-2 font-medium">Search</label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full border px-3 py-2 rounded-lg"
                />
            </div>

            {/* Price Range */}
            <div>
                <label className="block mb-2 font-medium">Price Range</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-1/2 border px-2 py-2 rounded-lg"
                    />
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-1/2 border px-2 py-2 rounded-lg"
                    />
                </div>
            </div>

            {/* Category  */}
            <div>
                <label className="block mb-2 font-medium">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg"
                >
                    <option value="">All</option>
                    {filterOptions.categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>



            {/* Size  */}
            <div>
                <label className="block mb-2 font-medium">Size</label>
                <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg"
                >
                    <option value="">All</option>
                    {filterOptions.sizes.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>



            {/* Color */}
            <div>
                <label className="block mb-2 font-medium">Color</label>
                <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg"
                >
                    <option value="">All</option>
                    {filterOptions.colors.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>
            <button
                onClick={() => {
                    setSearch("")
                    setMinPrice("")
                    setMaxPrice("")
                    setCategory("")
                    setSize("")
                    setColor("")
                }}
                className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition"
            >
                Reset Filters
            </button>




        </div>
    )

}


export default FilterSidebar
