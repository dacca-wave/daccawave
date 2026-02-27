// UserLayout.jsx
// Layout for logged-in user dashboard pages

import { Outlet } from "react-router-dom"

function UserLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-6">
                <h2 className="font-bold text-lg mb-6">User Panel</h2>
                <ul className="space-y-3 text-gray-600">
                    <li>Profile</li>
                    <li>My Orders</li>
                    <li>Refunds</li>
                </ul>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-10">
                <Outlet />
            </main>

        </div>
    )
}

export default UserLayout
