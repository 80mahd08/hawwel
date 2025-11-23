"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SignedInContent from "./components/SignedInContent";

export default function Header() {
  const [userRole, setUserRole] = useState("");
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  return (
    <header>
      <div className="container">
        <div className="logo">
          <Link href="/">
            <Image
              src="/logo-removebg.png"
              width={90}
              height={70}
              alt="App logo"
            />
          </Link>
        </div>

        <div className="auth-section">
          <SignedOut>
            <div className="on-sign-out">
              <SignInButton>
                <button className="btn">
                  <span>Get Started</span>
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
    </header>
  );
}
