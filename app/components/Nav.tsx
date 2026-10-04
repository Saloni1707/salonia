import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5">
      <Link href="/" className="font-serif text-xl italic">Articles</Link>
      <div className="flex items-center gap-6 text-sm tracking-wide">
        <Link href="/art">Art</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}