import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { MobileNavbar } from "@/components/mobile-navbar";
import { getCurrentUser } from "@/lib/auth/server";

const guestLinks = [
  { href: "/", label: "Home" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Sign up" },
];

const authenticatedLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

export async function Navbar() {
  const user = await getCurrentUser();
  const links = user ? authenticatedLinks : guestLinks;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-start gap-4 px-4 py-4 sm:justify-between sm:px-6 lg:px-8">
        <MobileNavbar links={links} isAuthenticated={Boolean(user)} />
        <Link href="/" className="text-lg font-semibold text-slate-950">
          Talent Growth Blog
        </Link>
        <nav aria-label="Primary navigation" className="hidden sm:block">
          <ul className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-md px-3 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    Sign out
                  </button>
                </form>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  );
}
