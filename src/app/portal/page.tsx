import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { signOut } from "@/app/actions/auth";

type DocumentRow = {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  folder: string;
  created_at: string;
};

type FolderLinkRow = {
  id: string;
  title: string;
  url: string;
  folder: string;
  created_at: string;
};

type PortalPageProps = {
  searchParams?: Promise<{
    q?: string;
    folder?: string;
  }>;
};

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const params = (await searchParams) || {};
  const searchQuery = (params.q || "").trim().toLowerCase();
  const selectedFolder = (params.folder || "").trim();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, title, file_name, file_path, folder, created_at")
    .order("folder", { ascending: true })
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const { data: folderLinks, error: folderLinksError } = await supabase
    .from("folder_links")
    .select("id, title, url, folder, created_at")
    .order("folder", { ascending: true })
    .order("created_at", { ascending: false });

  if (folderLinksError) {
    throw new Error(folderLinksError.message);
  }

  const allFolderNames = Array.from(
    new Set([
      ...(documents || []).map((doc) => doc.folder),
      ...(folderLinks || []).map((link) => link.folder),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesFolder = !selectedFolder || doc.folder === selectedFolder;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery) ||
      doc.file_name.toLowerCase().includes(searchQuery) ||
      doc.folder.toLowerCase().includes(searchQuery);

    return matchesFolder && matchesSearch;
  });

  const filteredLinks = (folderLinks || []).filter((link) => {
    const matchesFolder = !selectedFolder || link.folder === selectedFolder;
    const matchesSearch =
      !searchQuery ||
      link.title.toLowerCase().includes(searchQuery) ||
      link.url.toLowerCase().includes(searchQuery) ||
      link.folder.toLowerCase().includes(searchQuery);

    return matchesFolder && matchesSearch;
  });

  const groupedDocuments = filteredDocuments.reduce<Record<string, DocumentRow[]>>(
    (acc, doc) => {
      if (!acc[doc.folder]) {
        acc[doc.folder] = [];
      }
      acc[doc.folder].push(doc);
      return acc;
    },
    {}
  );

  const groupedLinks = filteredLinks.reduce<Record<string, FolderLinkRow[]>>(
    (acc, link) => {
      if (!acc[link.folder]) {
        acc[link.folder] = [];
      }
      acc[link.folder].push(link);
      return acc;
    },
    {}
  );

  const visibleFolderNames = Array.from(
    new Set([...Object.keys(groupedDocuments), ...Object.keys(groupedLinks)])
  ).sort((a, b) => a.localeCompare(b));

  const totalDocuments = filteredDocuments.length;
  const totalLinks = filteredLinks.length;
  const totalFolders = visibleFolderNames.length;

  const navItemClass =
    "block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-purple-400/40 hover:bg-white/10 hover:text-white";

  return (
    <main className="min-h-screen bg-[#030b1d] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#081225] p-6 lg:flex lg:h-screen lg:sticky lg:top-0">
          <div className="mb-10">
            <h1 className="text-2xl font-bold">Employee Portal</h1>
            <p className="mt-2 text-sm text-gray-400">Employee Workspace</p>
          </div>

          <nav className="space-y-3 overflow-y-auto pr-2">
            <a
              href="#overview"
              className="block rounded-2xl bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Dashboard Overview
            </a>
            <a href="#search-filter" className={navItemClass}>
              Search & Filter
            </a>
            <a href="#documents" className={navItemClass}>
              Documents
            </a>
            <a href="#links" className={navItemClass}>
              Links
            </a>
            <a href="#profile" className={navItemClass}>
              Profile
            </a>
          </nav>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">
              {profile?.full_name || "Employee"}
            </p>
            <p className="mt-1 break-all text-xs text-gray-400">{user.email}</p>

            <form action={signOut} className="mt-4">
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:opacity-90"
              >
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_25%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.15),transparent_30%)]" />

          <div className="relative mx-auto max-w-7xl px-6 py-8">
            <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between lg:hidden">
              <div>
                <h1 className="text-3xl font-bold">Employee Dashboard</h1>
                <p className="mt-2 text-sm text-gray-300">{user.email}</p>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:opacity-90"
                >
                  Sign Out
                </button>
              </form>
            </header>

            <section id="overview" className="mb-8 scroll-mt-24">
              <div className="rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-2xl backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.2em] text-purple-300">
                  Welcome back
                </p>
                <h2 className="mt-2 text-4xl font-bold">Employee Dashboard</h2>
                <p className="mt-3 max-w-2xl text-gray-300">
                  Browse company files, open useful links, and quickly find what
                  you need with search and folder filters.
                </p>
              </div>
            </section>

            <section
              id="search-filter"
              className="mb-8 scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-semibold">Search & Filter</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Search across documents and links, or narrow results by folder.
                </p>
              </div>

              <form method="GET" className="grid gap-4 md:grid-cols-3">
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="Search documents or links..."
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400 md:col-span-2"
                />

                <select
                  name="folder"
                  defaultValue={selectedFolder}
                  className="rounded-2xl border border-white/10 bg-[#101935] px-4 py-3 text-white outline-none focus:border-purple-400"
                >
                  <option value="" className="bg-[#101935] text-white">
                    All folders
                  </option>
                  {allFolderNames.map((folder) => (
                    <option
                      key={folder}
                      value={folder}
                      className="bg-[#101935] text-white"
                    >
                      {folder}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3 md:col-span-3">
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:opacity-90"
                  >
                    Apply
                  </button>

                  <Link
                    href="/portal"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-gray-200 transition hover:bg-white/10"
                  >
                    Clear
                  </Link>
                </div>
              </form>
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <div
                id="documents"
                className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur"
              >
                <p className="text-sm text-gray-400">Available Documents</p>
                <h3 className="mt-2 text-3xl font-bold">{totalDocuments}</h3>
              </div>

              <div
                id="links"
                className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur"
              >
                <p className="text-sm text-gray-400">Links</p>
                <h3 className="mt-2 text-3xl font-bold">{totalLinks}</h3>
              </div>

              <div
                id="profile"
                className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur"
              >
                <p className="text-sm text-gray-400">Visible Folders</p>
                <h3 className="mt-2 text-3xl font-bold">{totalFolders}</h3>
              </div>
            </section>

            <section className="space-y-8">
              {visibleFolderNames.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <p className="text-gray-300">
                    No matching resources found. Try a different search or clear
                    the filter.
                  </p>
                </div>
              ) : (
                visibleFolderNames.map((folderName) => {
                  const folderDocs = groupedDocuments[folderName] || [];
                  const folderLinkItems = groupedLinks[folderName] || [];

                  return (
                    <div
                      key={folderName}
                      className="rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur"
                    >
                      <div className="mb-5">
                        <h3 className="text-2xl font-semibold">{folderName}</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {folderDocs.length} document
                          {folderDocs.length === 1 ? "" : "s"} •{" "}
                          {folderLinkItems.length} link
                          {folderLinkItems.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      {folderDocs.length > 0 && (
                        <div className="mb-6 space-y-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
                            Documents
                          </h4>
                          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
                            {folderDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <h5 className="text-lg font-semibold text-white">
                                    {doc.title}
                                  </h5>
                                  <p className="mt-1 text-sm text-gray-300">
                                    File: {doc.file_name}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    Uploaded:{" "}
                                    {new Date(doc.created_at).toLocaleString()}
                                  </p>
                                </div>

                                <Link
                                  href={`/portal/download?path=${encodeURIComponent(
                                    doc.file_path
                                  )}`}
                                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:opacity-90"
                                >
                                  Download
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {folderLinkItems.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
                            Links
                          </h4>
                          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
                            {folderLinkItems.map((link) => (
                              <div
                                key={link.id}
                                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <h5 className="text-lg font-semibold text-white">
                                    {link.title}
                                  </h5>
                                  <p className="mt-1 break-all text-sm text-gray-300">
                                    {link.url}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    Added:{" "}
                                    {new Date(link.created_at).toLocaleString()}
                                  </p>
                                </div>

                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:opacity-90"
                                >
                                  Open Link
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}