import React, { useState } from "react";
import StarIcon from "../../icons/StarIcon";

function StarRating() {
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const handleClick = () => setCurrentValue(value);
  return (
    <div className="flex justify-center pb-5">
      {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              style={{ display: "none" }}
              value={currentRating}
              onClick={() => setRating(currentRating)}
            />
            <StarIcon
              className="cursor-pointer" //di mugana ang hover
              style={{ cursor: "pointer" }}
              size={50}
              color={currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHover(currentRating)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
}

export default StarRating;
