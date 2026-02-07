export default function InputField({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  uppercase = false,
  disabled = false,
}) {
  const errorMessage =
    typeof error === "string" ? error : error ? "This field is required" : "";

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`flex items-center gap-3 rounded-xl border h-11 sm:h-12 px-3 ${
          error
            ? "border-2 border-red-500 bg-red-500/10 ring-2 ring-red-400/60"
            : "border border-[#cbb7ec] bg-[#e9e2f5]"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span className="text-[#6b4fb3]">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`w-full h-full outline-none bg-transparent text-[#2f2450] placeholder-[#7b6a9b] ${
            uppercase ? "uppercase" : ""
          }`}
          disabled={disabled}
        />
      </div>
      {errorMessage && (
        <p className="text-red-300 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
