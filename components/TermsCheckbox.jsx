export default function TermsCheckbox({ checked, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-white text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>
        I have read and agree to the{" "}
        <a
          href="#"
          className="underline text-black"
          onClick={(e) => {
            e.preventDefault();
            alert("Show Terms and Conditions");
          }}
        >
          Terms and Conditions
        </a>
      </span>
    </div>
  );
}
