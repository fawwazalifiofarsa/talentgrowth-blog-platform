"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/app/(auth)/actions";

type NavLink = {
  href: string;
  label: string;
};

export function MobileNavbar({
  links,
  isAuthenticated,
}: {
  links: NavLink[];
  isAuthenticated: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function closeSidebar() {
    setIsOpen(false);
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 text-slate-800 transition hover:bg-slate-100"
      >
        <span aria-hidden="true" className="space-y-1">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-50 transition ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-200 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        <div className="absolute inset-0">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeSidebar}
            tabIndex={isOpen ? 0 : -1}
            className="absolute inset-0 h-full w-full"
          />
          <aside
            className={`relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex min-h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-base font-semibold text-slate-950">
                Menu
              </span>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={closeSidebar}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-2xl leading-none text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex-1 px-3 py-4">
              <ul className="space-y-1 text-sm font-medium text-slate-700">
                {links.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeSidebar}
                        className={`flex min-h-11 items-center rounded-md px-3 transition ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {isAuthenticated ? (
              <form action={signOutAction} className="border-t border-slate-200 p-3">
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center rounded-md px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
