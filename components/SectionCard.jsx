export default function SectionCard({ title, icon, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="bg-white/10 border border-indigo-300 rounded-xl p-6 space-y-4">
        {children}
      </div>
    </section>
  );
}
