export default function SelectField({
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  hasError = false,
}) {
  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border h-11 sm:h-12 px-3 ${
        hasError
          ? "border-2 border-red-500 bg-red-500/10 ring-2 ring-red-400/60"
          : "border border-[#cbb7ec] bg-[#e9e2f5]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span className="text-[#6b4fb3]">{icon}</span>
      <select
        value={value}
        onChange={handleChange}
        className={`w-full h-full outline-none bg-transparent text-[#2f2450] ${
          disabled ? "text-[#6d5f88]" : ""
        }`}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
