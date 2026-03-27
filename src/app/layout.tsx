import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Employee Portal",
  description: "Employee document portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020b2c] text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07122f]">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center">
              <Image
                src="/Logo.jpg"
                alt="Lapparan logo"
                width={220}
                height={70}
                priority
                className="h-14 w-auto rounded-md bg-white p-1 object-contain"
              />
            </div>

            <button className="rounded-xl bg-gradient-to-r from-purple-600 via-blue-500 to-red-500 px-5 py-2 text-lg font-medium text-white shadow-md transition hover:scale-105">
              Sign Out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}