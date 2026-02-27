// Footer.jsx
// Simple footer for public pages

function Footer() {
    return (
        <footer className="bg-white border-t mt-10">
            <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-500">
                © {new Date().getFullYear()} Dacca Wave. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer
