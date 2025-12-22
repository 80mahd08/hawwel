"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { useState, useEffect } from "react";
import SignedInContent from "./components/SignedInContent";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Header() {
  const [userRole, setUserRole] = useState("");
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className={isMenuOpen ? "menu-open" : ""}>
      <div className="container">
        <div className="logo">
          <Link href="/">
            <Image
              src="/logo-removebg.png"
              width={90}
              height={70}
              alt="App logo"
              priority
            />
          </Link>
        </div>

        {/* Hamburger Button */}
        <button 
          className="hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="actions-wrapper">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="auth-section">
              <SignedOut>
                <div className="on-sign-out">
                  <SignInButton>
                    <button className="btn">
                      <span>{t('getStarted')}</span>
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>

              <SignedIn>
                <SignedInContent
                  role={userRole}
                  setRole={setUserRole}
                  loadingRole={isRoleLoading}
                  setLoadingRole={setIsRoleLoading}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
