import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Lapparan logo"
            width={220}
            height={70}
            priority
            className="h-14 w-auto rounded-md bg-white p-1 object-contain"
          />
        </div>

        <button className="rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105">
          Sign Out
        </button>
      </div>
    </header>
  );
}