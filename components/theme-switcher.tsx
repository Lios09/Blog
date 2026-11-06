"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import type { JSX, KeyboardEvent } from "react";
import { useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

function ThemeOption({
  icon,
  value,
  isActive,
  reduceMotion,
  onClick,
}: {
  icon: JSX.Element;
  value: string;
  isActive?: boolean;
  reduceMotion: boolean;
  onClick: (value: string) => void;
}) {
  return (
    <button
      data-active={isActive}
      className="relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[color] hover:text-foreground data-[active=true]:text-foreground [&_svg]:size-4"
      role="switch"
      type="button"
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      onClick={() => onClick(value)}
    >
      {icon}

      {isActive &&
        (reduceMotion ? (
          <span className="absolute inset-0 rounded-full border" />
        ) : (
          <motion.span
            layoutId="theme-option"
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="absolute inset-0 rounded-full border"
          />
        ))}
    </button>
  );
}

const THEME_OPTIONS = [
  {
    icon: <MonitorIcon aria-hidden="true" />,
    value: "system",
  },
  {
    icon: <SunIcon aria-hidden="true" />,
    value: "light",
  },
  {
    icon: <MoonIcon aria-hidden="true" />,
    value: "dark",
  },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const reduceMotion = usePrefersReducedMotion();

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isMounted) {
    return <div className="flex h-8 w-24" />;
  }

  const onKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = THEME_OPTIONS.findIndex((option) => option.value === theme);
    const start = current < 0 ? 0 : current;
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next =
      (start + direction + THEME_OPTIONS.length) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[next].value);
  };

  const options = THEME_OPTIONS.map((option) => (
    <ThemeOption
      key={option.value}
      icon={option.icon}
      value={option.value}
      isActive={theme === option.value}
      reduceMotion={reduceMotion}
      onClick={setTheme}
    />
  ));

  return (
    <fieldset
      className="inset-ring-1 inset-ring-border m-0 inline-flex min-w-0 items-center overflow-clip rounded-full border-0 bg-background p-0"
      aria-label="Color theme"
      onKeyDown={onKeyDown}
    >
      {options}
    </fieldset>
  );
}

export { ThemeSwitcher };
