import { useState } from "react";
import EmojiRating from "./EmojiRating";

export default function Question({ number, text, onAnswer }) {
  const [rating, setRating] = useState(null);
  const [notApplicable, setNotApplicable] = useState(false);

  const handleRating = (val) => {
    setRating(val);
    setNotApplicable(false);

    onAnswer({ number, rating: val, notApplicable: false });
  };

  const handleNAChange = (checked) => {
    setNotApplicable(checked);

    // Keep the last selected rating, just mark NA
    onAnswer({ number, rating: rating, notApplicable: checked });
  };

  return (
    <div className="mb-6">
      <p className="mb-2 font-medium">{number}. {text}</p>
      <EmojiRating
        value={rating}
        onChange={handleRating}
        notApplicable={notApplicable}
        onNotApplicableChange={handleNAChange}
      />
    </div>
  );
}
