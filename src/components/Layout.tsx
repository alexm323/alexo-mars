import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { site } from "../content/site";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Paint Names", href: "/paint-names" },
  { label: "Mission Debrief", href: "/mission-debrief.html" },
  { label: "Humbleshot", href: "/humbleshot" },
];

// A nav item can point at a real SPA route (client-side nav) or a
// standalone static file served as-is (needs a real page load).
function isStaticHref(href: string): boolean {
  return /\.\w+$/.test(href);
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-semibold text-slate-900 dark:text-white">
            {site.title}
          </Link>
          <nav className="flex gap-5 text-sm">
            {NAV.map((item) => {
              const active = location.pathname === item.href;
              const linkClassName = active
                ? "font-medium text-violet-600 dark:text-violet-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";
              return isStaticHref(item.href) ? (
                <a key={item.href} href={item.href} className={linkClassName}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} to={item.href} className={linkClassName}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">
        © {new Date().getFullYear()} {site.title}
      </footer>
    </div>
  );
}
