import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import Question from "../components/Question";
import TextField from "../components/TextField";
import Header from "../components/Header";

const questions = [
  "Responsiveness (Pag abi-abi).",
  "Reliability (Kalig-on sa serbisyo).",
  "Access & Facilities (Sayon tuoran ang opisina, komportable ug maayo ang mga pasilidad).",
  "Communication (Pamagi sa pag pasabot).",
  "Costs (Klaridad sa balayaran).",
  "Integrity (Matinud-anon, makiangayon, ug patas).",
  "Assurance (Kasiguruhan sa serbisyo).",
  "Outcome (Nanghatag ang hustong serbisyo).",
];

export default function Satisfaction() {
  const [answers, setAnswers] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [exitKey, setExitKey] = useState("");
  const navigate = useNavigate();

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({ ...prev, [answer.number]: answer }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ answers, suggestion, exitKey });
    navigate("/thankyou");
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "linear-gradient(to bottom, #1A237E, #3949AB, #5C6BC0)" }}
    >
      <Header />
      <main className="flex-grow flex justify-center p-4">
        <div
          className="rounded-xl shadow-md w-full max-w-2xl p-6"
          style={{ background: "linear-gradient(to bottom, #e9dac4ff, #eaddc3ff, #d0c8baff)" }}
        >
          <h1 className="text-2xl font-bold mb-6">Give Feedback</h1>

          <form onSubmit={handleSubmit}>
            {questions.map((q, i) => (
              <Question key={i} number={i + 1} text={q} onAnswer={handleAnswer} />
            ))}

            <TextField
              label="Do you have any suggestions or comments to help us improve?"
              placeholder="Write your suggestion here..."
              value={suggestion}
              onChange={setSuggestion}
              type="textarea"
            />

            {/* Exit Key with Icon */}
            <div className="mb-2">Enter your Exit Key.</div>
            <div className="flex items-center gap-2 mb-4 border rounded-md px-3 py-2">
              <FaKey className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter exit key..."
                value={exitKey}
                onChange={(e) => setExitKey(e.target.value)}
                className="flex-1 outline-none text-gray-700"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition"
            >
              SUBMIT FEEDBACK
            </button>
          </form>
          <div className="text-center text-gray-400 text-sm mt-4">
            &copy; 2025 LMT. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
}
