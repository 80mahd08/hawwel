"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="btn">
          Go back home
        </Link>
      </div>

      <style jsx>{`
        .not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          padding: 2rem;
          text-align: center;
        }
        h1 {
          font-size: 6rem;
          color: #1c73a1;
          margin: 0;
          line-height: 1;
        }
        h2 {
          font-size: 2rem;
          color: #334155;
          margin-bottom: 1rem;
        }
        p {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
