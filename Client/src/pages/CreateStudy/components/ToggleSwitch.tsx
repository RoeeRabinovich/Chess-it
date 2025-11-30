interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}

export const ToggleSwitch = ({
  id,
  label,
  checked,
  onChange,
  ariaLabel,
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <button
        id={id}
        onClick={() => onChange(!checked)}
        className={`focus:ring-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
          checked ? "bg-pastel-mint" : "bg-pastel-red"
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

