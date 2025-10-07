import type { Metadata } from "next";
import "./globals.scss";
import "fhf/dist/normalize.css";
import "fhf/dist/layout.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { FavCountProvider } from "@/context/FavCountProvider";
import { Provider } from "@/components/ui/provider";
import { OrderNumberProvider } from "@/context/OrderNumberProvider";

export const metadata: Metadata = {
  title: "Hawwel",
  description: "house rent per day site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OrderNumberProvider>
          <ClerkProvider>
            <FavCountProvider>
              <Header />
              <Provider>{children}</Provider>
            </FavCountProvider>
          </ClerkProvider>
        </OrderNumberProvider>
      </body>
    </html>
  );
}
