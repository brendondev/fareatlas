import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FareAtlas",
  description:
    "Travel intelligence for Australians comparing points seats, cash fares and loyalty offers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
