// InteractiveStarRating.jsx
// Clickable Professional Star Rating

import { Star } from "lucide-react"
import { useState } from "react"

function InteractiveStarRating({ value = 0, onChange, size = 24 }) {

    const [hoverValue, setHoverValue] = useState(0)

    return (
        <div className="flex gap-1 cursor-pointer">

            {[1, 2, 3, 4, 5].map((star) => {

                const active = hoverValue
                    ? star <= hoverValue
                    : star <= value

                return (
                    <Star
                        key={star}
                        size={size}
                        fill={active ? "#facc15" : "transparent"}
                        stroke={active ? "#facc15" : "#d1d5db"}
                        onMouseEnter={() => setHoverValue(star)}
                        onMouseLeave={() => setHoverValue(0)}
                        onClick={() => onChange(star)}
                        className="transition-all duration-150"
                    />
                )
            })}

        </div>
    )
}

export default InteractiveStarRating
