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

    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions !== totalQuestions) {
      alert("Please complete all questions before submitting. Thank you!");
      return;
    }

    const hasIncompleteRating = Object.values(answers).some(
      (answer) => !answer.notApplicable && (answer.rating == null)
    );

    if (hasIncompleteRating) {
      alert("Please rate all applicable questions before submitting. Thank you!");
      return;
    }

    if (!exitKey.trim()) {
      alert("Please enter your name before submitting.");
      return;
    }

    console.log({ answers, suggestion, exitKey });
    navigate("/thankyou");
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "linear-gradient(to bottom, #381366, #4A2279, #573483)" }}
    >
      <Header />
      <main className="flex-grow flex justify-center p-4">
        <div className="rounded-xl shadow-md w-full max-w-2xl p-6 bg-white">
          <h1 className="text-2xl font-bold mb-1 text-center">Give Feedback</h1>

          <p className="mb-8 text-center text-gray-500 text-sm">
            Please rate our services: <i>(Note: Answer after visiting the office.)</i>
          </p>

          <form onSubmit={handleSubmit}>
            {questions.map((q, index) => (
              <Question
                key={index}
                number={index + 1}
                text={q}
                onAnswer={handleAnswer}
              />
            ))}

            <div className="mb-4">
              <TextField
                label="Any suggestions to help us improve?"
                placeholder="Write your suggestion here..."
                value={suggestion}
                onChange={setSuggestion}
                type="textarea"
                maxLength={300}
              />
              <p className="text-right text-gray-500 text-xs mt-1">
                {suggestion.length}/300
              </p>
            </div>

            <div className="mb-2">
              Enter your name: <i className="text-gray-500">(Anonymous when viewed in system)</i>
            </div>

            <div className={`flex items-center gap-2 mb-4 border rounded-md px-3 py-2 ${!exitKey.trim() ? "border-red-500" : ""}`}>
              <FaKey className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter full name..."
                value={exitKey}
                onChange={(e) => setExitKey(e.target.value)}
                className="flex-1 outline-none text-gray-700 border-none"
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
