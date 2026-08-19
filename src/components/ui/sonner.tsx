import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/components/theme/ThemeProvider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme.scheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-fg group-[.toaster]:border-line group-[.toaster]:shadow-float group-[.toaster]:rounded-card group-[.toaster]:font-body",
          description: "group-[.toast]:text-fg-muted",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-fg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
