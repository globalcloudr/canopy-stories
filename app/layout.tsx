import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canopy Stories",
  description: "Success story production product for the Canopy platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

