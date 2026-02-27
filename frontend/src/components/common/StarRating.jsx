// StarRating.jsx
// Professional Reusable Star Component (Supports Half Stars)

import { Star } from "lucide-react"

function StarRating({ rating = 0, size = 18 }) {

    const stars = []

    for (let i = 1; i <= 5; i++) {

        if (rating >= i) {
            // Full star
            stars.push(
                <Star
                    key={i}
                    size={size}
                    fill="#facc15"
                    stroke="#facc15"
                />
            )
        }

        else if (rating >= i - 0.5) {
            // Half star
            stars.push(
                <div key={i} style={{ position: "relative", width: size }}>
                    <Star
                        size={size}
                        stroke="#facc15"
                    />
                    <Star
                        size={size}
                        fill="#facc15"
                        stroke="#facc15"
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: `${size / 2}px`,
                            overflow: "hidden"
                        }}
                    />
                </div>
            )
        }

        else {
            // Empty star
            stars.push(
                <Star
                    key={i}
                    size={size}
                    stroke="#d1d5db"
                />
            )
        }
    }

    return <div className="flex gap-1">{stars}</div>
}

export default StarRating
