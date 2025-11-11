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

  const handleNA = () => {
    setNotApplicable(!notApplicable);
    setRating(null);
    onAnswer({ number, rating: null, notApplicable: !notApplicable });
  };

  return (
    <div className="mb-6">
      <p className="mb-2 font-medium">{number}. {text}</p>
      <div className="flex items-center space-x-4">
        <EmojiRating value={rating} onChange={handleRating} />
        
      </div>
    </div>
  ); 
}
