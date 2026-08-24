import { forwardRef, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Theme border width as an explicit length. `border-theme` + a border color
 * in the same cn() call collide inside tailwind-merge (both read as colors),
 * so fields set the width this way to keep the theme's stroke.
 */
export const FIELD_BORDER = "border-[length:var(--border-w)]";

/* ------------------------------------------------------------------ */
/* Field wrapper — label above, inline error below                     */
/* ------------------------------------------------------------------ */
interface FieldProps {
  id: string;
  label: string;
  /** Small trailing note in the label (e.g. "Optional"). */
  note?: string;
  /** Marks the label with a red asterisk. */
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Red asterisk marking a required field's label — visual only, `aria-hidden` since the input itself carries `required`/`aria-required`. */
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-destructive">
      *
    </span>
  );
}

export function Field({ id, label, note, required, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="flex items-baseline gap-2">
        <span>
          {label}
          {required && <RequiredMark />}
        </span>
        {note && <span className="font-body text-xs normal-case tracking-normal text-fg-subtle">{note}</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm leading-snug text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Attendance — segmented group of real radios styled as pills/tiles    */
/* ------------------------------------------------------------------ */
interface Option {
  readonly value: string;
  readonly label: string;
}

interface SegmentedRadioProps {
  name: string;
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function SegmentedRadio({ name, label, options, value, onChange, required }: SegmentedRadioProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="t-accent mb-2 block text-[0.68rem] text-fg-muted">
        {label}
        {required && <RequiredMark />}
      </legend>
      <div className={cn("grid gap-1.5 sm:gap-2", options.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((o) => (
          <label key={o.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-11 items-center justify-center rounded-btn border-line-strong bg-surface px-1.5 py-2 text-center text-[0.8rem] leading-snug text-fg sm:px-3 sm:text-sm",
                FIELD_BORDER,
                "transition-[background-color,color,border-color] duration-micro ease-theme",
                "hover:border-fg",
                "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
              )}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Guests — stepper bounded by min/max                                  */
/* ------------------------------------------------------------------ */
interface StepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  decrementLabel: string;
  incrementLabel: string;
  required?: boolean;
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { id, label, value, min, max, onChange, decrementLabel, incrementLabel, required },
  ref
) {
  const btn =
    "flex h-11 w-11 shrink-0 items-center justify-center text-fg transition-colors duration-micro ease-theme hover:bg-fg/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:bg-fg/[0.08] focus-visible:relative focus-visible:z-10 disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4";
  return (
    <div className="min-w-0">
      <span id={`${id}-label`} className="t-accent mb-2 block text-[0.68rem] text-fg-muted">
        {label}
        {required && <RequiredMark />}
      </span>
      <div
        ref={ref}
        role="group"
        aria-labelledby={`${id}-label`}
        className={cn("inline-flex h-11 items-stretch overflow-hidden rounded-field border-input bg-surface", FIELD_BORDER)}
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={decrementLabel}
          className={btn}
        >
          <Minus aria-hidden="true" />
        </button>
        <output
          aria-live="polite"
          aria-atomic="true"
          className="t-display flex min-w-12 items-center justify-center border-x-[length:var(--border-w)] border-input px-2 text-xl leading-none text-fg tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={incrementLabel}
          className={btn}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
