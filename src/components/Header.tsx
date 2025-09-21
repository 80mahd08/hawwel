"use client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import SignedInContent from "./SignedInContent";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [role, setRole] = useState("");
  const [loadingRole, setLoadingRole] = useState(true);

  return (
    <header>
      <div className="container">
        <div className="logo">
          <Link href="/">
            <Image
              src={"/logo-removebg.png"}
              width={90}
              height={70}
              alt="logo"
            />
          </Link>
        </div>
        <div className="btns">
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
              role={role}
              setRole={setRole}
              loadingRole={loadingRole}
              setLoadingRole={setLoadingRole}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
