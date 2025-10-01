export default function TextField({ label, placeholder, value, onChange, type="text" }) {
  return (
    <div className="mb-6">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
        />
      )}
    </div>
  );
}
