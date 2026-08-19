import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { submitRsvp, type RsvpPayload } from "@/lib/rsvp";
import { rsvp } from "@/data/siteData";
import { useTheme, useThemeMotion } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { FIELD_BORDER, Field, SegmentedRadio, Stepper } from "./RsvpFields";
import { RsvpSuccess } from "./RsvpSuccess";

/* ------------------------------------------------------------------ */
/* State & validation                                                  */
/* ------------------------------------------------------------------ */
type Phase = "form" | "success";
type FieldKey = "name" | "email" | "phone";
type Errors = Partial<Record<FieldKey, string>>;

interface FormValues {
  name: string;
  email: string;
  phone: string;
  attendance: string;
  guests: number;
  interest: string;
  message: string;
}

const { fields } = rsvp;

const initialValues = (): FormValues => ({
  name: "",
  email: "",
  phone: "",
  attendance: fields.attendance.options[0].value,
  guests: fields.guests.min,
  interest: fields.interest.options[0].value,
  message: "",
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELD_ORDER: readonly FieldKey[] = ["name", "email", "phone"];

/* Validation + a11y micro-copy (not part of siteData). */
const COPY = {
  nameError: "Please enter your name (at least 2 characters).",
  emailError: "Please enter a valid email address.",
  phoneError: "Please enter a valid phone number (7–15 digits).",
  optional: "Optional",
  fewer: "Fewer guests",
  more: "More guests",
} as const;

function validate(v: FormValues): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = COPY.nameError;
  if (!EMAIL_RE.test(v.email.trim())) errors.email = COPY.emailError;
  const digits = v.phone.replace(/\D/g, "");
  if (v.phone.trim() && (digits.length < 7 || digits.length > 15)) errors.phone = COPY.phoneError;
  return errors;
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */
interface RsvpPanelProps {
  /** Fired once the success state is on screen (confetti hook-in). */
  onSuccess?: () => void;
  className?: string;
}

/**
 * The "save your spot" form and its success state, swapped with a GSAP cross-fade
 * (instant under reduced motion). Focus moves to the success heading on
 * swap (see RsvpSuccess) and back to the name field on "send another".
 * Layout-agnostic — the section places it in its own composition.
 */
export function RsvpPanel({ onSuccess, className }: RsvpPanelProps) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const motion = useThemeMotion();
  const { palette } = useTheme();

  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const reentryRef = useRef(false);

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");

  const update = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next: Errors = { ...e };
      delete next[key as FieldKey];
      return next;
    });
  }, []);

  const focusFirstInvalid = (errs: Errors) => {
    const first = FIELD_ORDER.find((k) => errs[k]);
    const refs: Record<FieldKey, typeof nameRef> = { name: nameRef, email: emailRef, phone: phoneRef };
    if (first) refs[first].current?.focus();
  };

  const swapToSuccess = () => {
    const root = rootRef.current;
    const form = formRef.current;
    // Hold the panel's height so the section doesn't jump under the reader.
    if (root && form) root.style.minHeight = `${form.offsetHeight}px`;
    if (form) form.style.pointerEvents = "none";
    if (!form || prefersReducedMotion()) {
      setPhase("success");
      return;
    }
    gsap.to(form, {
      autoAlpha: 0,
      y: -motion.distance * 0.35,
      duration: motion.duration.micro * 1.6,
      ease: motion.easeInOut,
      onComplete: () => setPhase("success"),
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstInvalid(errs);
      return;
    }
    setSubmitting(true);
    const payload: RsvpPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      attendance: values.attendance,
      guests: values.guests,
      interest: values.interest,
      message: values.message.trim(),
      theme: palette.id,
    };
    try {
      await submitRsvp(payload);
      // Leave `submitting` true until the form unmounts (phase → success) so the
      // still-visible form can't be re-submitted during the fade-out.
      swapToSuccess();
      toast.success(rsvp.successToast);
    } catch {
      setSubmitting(false);
      toast.error(rsvp.errorToast);
    }
  };

  const reset = () => {
    reentryRef.current = true;
    setValues(initialValues());
    setErrors({});
    setSubmitting(false);
    setPhase("form");
  };

  // Entrance of whichever face just mounted + focus management.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (phase === "success") {
        onSuccess?.();
      } else if (reentryRef.current) {
        reentryRef.current = false;
        root.style.minHeight = "";
        const form = formRef.current;
        if (form && !prefersReducedMotion()) {
          // Opacity only (not autoAlpha): a visibility-hidden field drops
          // focus, and the name field should be ready as the form fades in.
          gsap.fromTo(
            form,
            { opacity: 0, y: motion.distance * 0.35 },
            { opacity: 1, y: 0, duration: motion.duration.micro * 1.6, ease: motion.ease, clearProps: "transform,opacity" }
          );
        }
        nameRef.current?.focus({ preventScroll: true });
      }
      ScrollTrigger.refresh();
    },
    { scope: rootRef, dependencies: [phase] }
  );

  const describedBy = (k: FieldKey) => (errors[k] ? `${id(k)}-error` : undefined);

  return (
    <div ref={rootRef} className={cn("relative flex flex-col", className)}>
      {phase === "form" ? (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-7">
          <Field id={id("name")} label={fields.name.label} error={errors.name}>
            <Input
              ref={nameRef}
              id={id("name")}
              className={FIELD_BORDER}
              name="name"
              autoComplete="name"
              placeholder={fields.name.placeholder}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
              required
            />
          </Field>

          <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
            <Field id={id("email")} label={fields.email.label} error={errors.email}>
              <Input
                ref={emailRef}
                id={id("email")}
                className={FIELD_BORDER}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={fields.email.placeholder}
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy("email")}
                required
              />
            </Field>
            <Field id={id("phone")} label={fields.phone.label} note={COPY.optional} error={errors.phone}>
              <Input
                ref={phoneRef}
                id={id("phone")}
                className={FIELD_BORDER}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={fields.phone.placeholder}
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={describedBy("phone")}
              />
            </Field>
          </div>

          <SegmentedRadio
            name={id("attendance")}
            label={fields.attendance.label}
            options={fields.attendance.options}
            value={values.attendance}
            onChange={(v) => update("attendance", v)}
          />

          <div className="grid gap-7 sm:grid-cols-[auto_1fr] sm:gap-5">
            <Stepper
              id={id("guests")}
              label={fields.guests.label}
              value={values.guests}
              min={fields.guests.min}
              max={fields.guests.max}
              onChange={(v) => update("guests", v)}
              decrementLabel={COPY.fewer}
              incrementLabel={COPY.more}
            />
            <Field id={id("interest")} label={fields.interest.label}>
              <Select value={values.interest} onValueChange={(v) => update("interest", v)}>
                <SelectTrigger id={id("interest")} aria-label={fields.interest.label} className={FIELD_BORDER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.interest.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field id={id("message")} label={fields.message.label}>
            <Textarea
              id={id("message")}
              className={FIELD_BORDER}
              name="message"
              rows={4}
              placeholder={fields.message.placeholder}
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </Field>

          <div className="pt-2">
            <MagneticButton className="block w-full sm:inline-block sm:w-auto">
              <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="w-full sm:w-auto sm:min-w-[14rem]">
                {submitting ? (
                  <>
                    <Loader2 aria-hidden="true" className="animate-spin" />
                    {rsvp.submitting}
                  </>
                ) : (
                  rsvp.cta
                )}
              </Button>
            </MagneticButton>
          </div>
        </form>
      ) : (
        <RsvpSuccess onAnother={reset} />
      )}
    </div>
  );
}
