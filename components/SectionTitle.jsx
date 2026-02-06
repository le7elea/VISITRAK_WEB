export default function SectionTitle({ icon, text, hasError = false }) {
  const accent = hasError ? "bg-red-400" : "bg-sky-400";
  const iconColor = hasError ? "text-red-300" : "text-sky-300";
  const textColor = hasError ? "text-red-200" : "text-white";

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`inline-block h-4 w-[3px] rounded-full ${accent}`} />
      <span className={`flex items-center ${iconColor} text-sm`}>{icon}</span>
      <span className={`text-sm sm:text-base font-semibold tracking-wide ${textColor}`}>
        {text}
      </span>
    </div>
  );
}
