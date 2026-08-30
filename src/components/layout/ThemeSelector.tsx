import { useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ThemePreference, useTheme } from "@/lib/use-theme";

const themeOptions: Array<{
  icon: typeof Sun;
  label: string;
  value: ThemePreference;
}> = [
  {
    icon: Sun,
    label: "Light",
    value: "light",
  },
  {
    icon: Moon,
    label: "Dark",
    value: "dark",
  },
  {
    icon: Laptop,
    label: "System",
    value: "system",
  },
];

export function ThemeSelector() {
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    themeOptions.find((option) => option.value === theme) ?? themeOptions[2];
  const SelectedIcon = selectedOption.icon;

  return (
    <div
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <Button
        className="size-8 text-muted-foreground hover:text-foreground"
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Theme: ${selectedOption.label}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <SelectedIcon aria-hidden="true" />
      </Button>

      {isOpen ? (
        <div
          className="absolute top-10 right-0 z-[700] grid min-w-36 gap-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          role="menu"
          aria-label="Theme"
        >
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === theme;

          return (
            <Button
              className={cn(
                "h-8 w-full justify-start gap-2 px-2 text-xs",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-transparent dark:hover:bg-muted/70",
              )}
              key={option.value}
              type="button"
              variant="ghost"
              aria-label={`Use ${option.label} theme`}
              aria-pressed={isSelected}
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
            >
              <Icon aria-hidden="true" />
              <span>{option.label}</span>
            </Button>
          );
        })}
        </div>
      ) : null}
    </div>
  );
}
