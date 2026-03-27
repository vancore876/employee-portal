import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employee Portal",
  description: "Secure employee document portal",
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