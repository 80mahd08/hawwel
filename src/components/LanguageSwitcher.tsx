"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition, useState, useEffect, useRef } from "react";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const localActive = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳' }
  ];

  const handleLanguageChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="lang-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        disabled={isPending}
      >
        <span className="lang-icon">🌐</span>
        <span className="lang-code">{localActive.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${localActive === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isPending}
            >
              <span className="flag">{lang.flag}</span>
              <span className="label">{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-switcher {
          position: relative;
          z-index: 50;
        }

        .lang-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid transparent;
          padding: 6px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-light);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .lang-btn:hover, .lang-btn:focus-visible {
          background-color: var(--btn-secondary-bg);
          color: var(--text);
        }

        .lang-icon {
          font-size: 1.1rem;
        }

        .lang-dropdown {
          position: absolute;
          top: 120%;
          right: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          padding: 6px;
          min-width: 150px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: fadeIn 0.15s ease-out;
        }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--text);
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;
          font-size: 0.95rem;
        }

        .lang-option:hover {
          background-color: var(--btn-secondary-bg);
        }

        .lang-option.active {
          background-color: rgba(28, 115, 161, 0.1);
          color: var(--title);
          font-weight: 600;
        }

        .flag {
          font-size: 1.1rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
