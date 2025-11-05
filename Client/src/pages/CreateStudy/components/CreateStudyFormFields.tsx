interface CategorySelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled: boolean;
}

export const CategorySelect = ({
  value,
  onChange,
  error,
  disabled,
}: CategorySelectProps) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="category"
        className="text-foreground block text-sm font-medium"
      >
        Category <span className="text-destructive">*</span>
      </label>
      <select
        id="category"
        name="category"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`border-border bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive"
            : ""
        }`}
      >
        <option value="">Select a category</option>
        <option value="Opening">Opening</option>
        <option value="Endgame">Endgame</option>
        <option value="Strategy">Strategy</option>
        <option value="Tactics">Tactics</option>
      </select>
      {error && (
        <p className="text-destructive font-minecraft flex items-center gap-1 text-xs">
          <span className="text-destructive">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

interface DescriptionTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export const DescriptionTextarea = ({
  value,
  onChange,
  disabled,
}: DescriptionTextareaProps) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="description"
        className="text-foreground block text-sm font-medium"
      >
        Description
      </label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={3}
        placeholder="Optional description for your study..."
        className="border-border bg-background placeholder:text-muted-foreground focus:ring-primary w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
};

interface VisibilityRadioProps {
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled: boolean;
}

export const VisibilityRadio = ({
  value,
  onChange,
  error,
  disabled,
}: VisibilityRadioProps) => {
  return (
    <div className="space-y-2">
      <label className="text-foreground block text-sm font-medium">
        Visibility <span className="text-destructive">*</span>
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isPublic"
            checked={value === true}
            onChange={() => onChange(true)}
            disabled={disabled}
            className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm">Public</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isPublic"
            checked={value === false}
            onChange={() => onChange(false)}
            disabled={disabled}
            className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm">Private</span>
        </label>
      </div>
      {error && (
        <p className="text-destructive font-minecraft flex items-center gap-1 text-xs">
          <span className="text-destructive">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};
