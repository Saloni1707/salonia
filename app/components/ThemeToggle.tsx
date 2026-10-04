"use client";

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {} // remember the choice
  }
  return (
    <button onClick={toggle} aria-label="Switch between light and dark mode" className="text-sm tracking-wide">
      <span className="when-light">Dark</span>
      <span className="when-dark">Light</span>
    </button>
  );
}