export default function InputField({ icon, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2">
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full outline-none bg-transparent"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
