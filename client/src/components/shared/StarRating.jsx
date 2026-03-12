import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, max = 5, label }) => {
    const [hover, setHover] = useState(null);

    return (
        <div>
            {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
            <div className="flex gap-2">
                {[...Array(max)].map((_, index) => {
                    const ratingValue = index + 1;
                    const isFilled = ratingValue <= (hover || value);

                    return (
                        <button
                            key={index}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onClick={() => onChange(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(null)}
                        >
                            <Star
                                className={`w-8 h-8 ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                                    }`}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StarRating;
