interface RangeSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  minLabel?: string;
  maxLabel?: string;
  formatValue?: (value: number) => string;
}

export const RangeSlider = ({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  minLabel,
  maxLabel,
  formatValue,
}: RangeSliderProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-muted-foreground mb-2 block text-sm font-medium"
      >
        {label}: {formatValue ? formatValue(value) : value}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="text-muted-foreground mt-1 flex justify-between text-xs">
        <span>{minLabel ?? min}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  );
};

