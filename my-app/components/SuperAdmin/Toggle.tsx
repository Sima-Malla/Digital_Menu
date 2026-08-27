"use client";

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
};

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5",
        "transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-orange-600" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "block h-5 w-5 rounded-full bg-white shadow-sm",
          "transform transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}