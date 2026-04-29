"use client";

import { useAuth } from "@/lib/auth-context";
import UserDropdown from "@/components/UserDropdown";
import { AlertTriangle, CalendarIcon, Contact, CrownIcon, HomeIcon, MicIcon, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function Navbar() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", icon: HomeIcon, label: "Dashboard", badge: null },
    { href: "/appointments", icon: CalendarIcon, label: "Appointments", badge: null },
    { href: "/voice", icon: MicIcon, label: "AI Agent", badge: "Soon" },
    { href: "/pro", icon: CrownIcon, label: "Pro", badge: null },
    { href: "/contact", icon: Contact, label: "Contact", badge: null },
    { href: "/emergency", icon: AlertTriangle, label: "Emergency", badge: null },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/hero.png" alt="HealthCare Logo" className="w-8 h-8 sm:w-9 sm:h-9" />
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 transition-colors ${
                  pathname === link.href
                    ? "text-foreground hover:text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary leading-none">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">
                {profile?.firstName} {profile?.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {profile?.email}
              </span>
            </div>
            <UserDropdown />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border/50 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary leading-none ml-auto">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="xl:hidden pt-3 mt-3 border-t border-border/50">
              <div className="px-4 py-2">
                <span className="text-sm font-medium text-foreground block">
                  {profile?.firstName} {profile?.lastName}
                </span>
                <span className="text-xs text-muted-foreground block mt-1">
                  {profile?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
