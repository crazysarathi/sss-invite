import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/audio";

/**
 * Floating sound on/off toggle. Lives OUTSIDE the ScrollSmoother wrapper
 * (position:fixed) and above the opening screen (z-100), so the music can
 * be silenced from the very first frame. Mirrors BackToTop's dress.
 */
export function SoundToggle() {
  const muted = useSyncExternalStore(
    (cb) => sound.subscribe(cb),
    () => sound.muted,
    () => true
  );
  const Icon = muted ? VolumeX : Volume2;
  return (
    <button
      type="button"
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      onClick={(e) => {
        // Don't let the tap fall through to the opening screen's gate.
        e.stopPropagation();
        sound.setMuted(!muted);
      }}
      className={cn(
        "fixed bottom-6 left-6 z-[120] flex h-12 w-12 items-center justify-center rounded-btn",
        "border-theme border-line-strong bg-surface/90 shadow-float backdrop-blur-md",
        "transition-colors duration-500 ease-out",
        "hover:border-primary hover:text-primary focus-visible:text-primary",
        muted ? "text-fg-subtle" : "text-primary"
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
