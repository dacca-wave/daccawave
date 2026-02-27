// AdminLayout.jsx
// Layout for admin dashboard pages

import { Outlet } from "react-router-dom"

function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Admin Sidebar */}
            <aside className="w-64 bg-white shadow-md p-6">
                <h2 className="font-bold text-lg mb-6">Admin Panel</h2>
                <ul className="space-y-3 text-gray-600">
                    <li>Dashboard</li>
                    <li>Products</li>
                    <li>Orders</li>
                    <li>Coupons</li>
                </ul>
            </aside>

            {/* Admin Content */}
            <main className="flex-1 p-10">
                <Outlet />
            </main>

        </div>
    )
}

export default AdminLayout
