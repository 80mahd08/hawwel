import type { Metadata, Viewport } from "next";
import "@/scss/globals.scss";
import "@/scss/normalize.scss";
import Header from "@/components/header/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { FavCountProvider } from "@/context/FavCountProvider";
import {
  PendingCountProvider,
} from "@/context/PendingCountProvider";
import { currentUser } from "@clerk/nextjs/server";
import { NotificationCountProvider } from "@/context/NotificationCountProvider";
import PageTransition from "@/components/PageTransition/PageTransition";

export const metadata: Metadata = {
  title: "hawwel",
  description: "Your perfect property rental platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "hawwel",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1c73a1",
  width: "device-width",
  initialScale: 1,
};

import { ChatProvider } from "@/context/ChatContext";
import ChatWidget from "@/components/Chat/ChatWidget";
import { Toaster } from "react-hot-toast";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  let user = null;
  try {
    user = await currentUser();
  } catch {
  }
  const userId = user?.id;
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as "en" | "fr" | "ar")) {
    notFound();
  }

  // Provide all messages to the client
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* ... existing head scripts ... */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            <NotificationCountProvider clerkId={userId || undefined}>
              <PendingCountProvider clerkId={userId || undefined}>
                <FavCountProvider>
                  <ChatProvider>
                    <Header />
                    <PageTransition>{children}</PageTransition>
                    <ChatWidget />
                    <Toaster 
                      position="top-center"
                      toastOptions={{
                        className: 'toast-premium',
                        duration: 3000,
                        style: {
                          background: 'var(--card-bg)',
                          color: 'var(--text)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-md)',
                        },
                      }}
                    />
                  </ChatProvider>
                </FavCountProvider>
              </PendingCountProvider>
            </NotificationCountProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
