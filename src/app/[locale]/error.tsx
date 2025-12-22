"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Oops! Something went wrong</h1>
        <p>We&apos;re sorry, but an unexpected error occurred. Please try again or return home.</p>
        <div className="error-actions">
          <button onClick={() => reset()} className="btn">
            Try again
          </button>
          <Link href="/" className="btn secondary">
            Go back home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          padding: 2rem;
          text-align: center;
        }
        .error-content h1 {
          font-size: 2.5rem;
          color: #1c73a1;
          margin-bottom: 1rem;
        }
        .error-content p {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .secondary {
          background-color: #f1f5f9;
          color: #475569;
        }
        .secondary:hover {
          background-color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
