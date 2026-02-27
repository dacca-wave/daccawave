// PublicLayout.jsx
// This layout will wrap all public pages (Home, Login, Shop etc.)

import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import { Outlet } from "react-router-dom"


function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Top Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-grow">
                <Outlet />
            </main>


            {/* Footer Section */}
            <Footer />

        </div>
    )
}

export default PublicLayout
