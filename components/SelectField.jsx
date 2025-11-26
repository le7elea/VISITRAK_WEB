export default function SelectField({ icon, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2">
      {icon}
      <select
        value={value}
        onChange={onChange}
        className={`w-full outline-none bg-transparent ${disabled ? "text-gray-500" : ""}`}
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
