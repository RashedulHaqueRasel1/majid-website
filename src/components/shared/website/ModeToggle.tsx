"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-8 rounded-full border border-border bg-background p-2 transition-all hover:bg-accent md:h-10 md:w-10"
      aria-label="Toggle theme"
    >
      <div className="relative h-full w-full">
        <Sun className="absolute inset-0 h-full w-full rotate-0 scale-100 opacity-100 transition-all duration-300 dark:rotate-90 dark:scale-0 dark:opacity-0" />
        <Moon className="absolute inset-0 h-full w-full -rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
