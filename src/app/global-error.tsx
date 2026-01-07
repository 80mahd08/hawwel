'use client';

import "@/scss/globals.scss";
import { Outfit } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="error-container">
          <div className="error-content">
            <h1>Something went wrong!</h1>
            <p>A critical error occurred. Please try refreshing the page.</p>
            <button onClick={() => reset()} className="btn">
              Try again
            </button>
          </div>
        </div>
        <style jsx>{`
            .error-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              text-align: center;
              background: var(--bg);
              color: var(--text);
            }
            .error-content h1 {
              font-size: 2.5rem;
              color: var(--title);
              margin-bottom: 1rem;
            }
            .error-content p {
              color: var(--text-light);
              margin-bottom: 2rem;
              font-size: 1.1rem;
            }
            .btn {
              background: var(--title);
              color: white;
              padding: 12px 24px;
              border-radius: 12px;
              border: none;
              font-weight: 600;
              cursor: pointer;
            }
        `}</style>
      </body>
    </html>
  );
}
