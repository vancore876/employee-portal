import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { signOut } from "@/app/actions/auth";
import { uploadDocument } from "@/app/actions/upload";
import { createFolder } from "@/app/actions/folders";
import { updateUserRole } from "@/app/actions/admin-users";
import { deleteDocument } from "@/app/actions/delete-document";
import { renameFolder, deleteFolder } from "@/app/actions/manage-folders";
import { createFolderLink, deleteFolderLink } from "@/app/actions/folder-links";
import SubmitButton from "@/components/submit-button";
import StatusBanner from "@/components/status-banner";

type AdminPageProps = {
  searchParams?: Promise<{
    userQ?: string;
    docQ?: string;
    linkQ?: string;
    folder?: string;
    success?: string;
    error?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) || {};
  const userQuery = (params.userQ || "").trim().toLowerCase();
  const docQuery = (params.docQ || "").trim().toLowerCase();
  const linkQuery = (params.linkQ || "").trim().toLowerCase();
  const selectedFolder = (params.folder || "").trim();
  const success = params.success || "";
  const error = params.error || "";

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

  if (!profile || profile.role !== "admin") {
    redirect("/portal");
  }

  const { data: folders, error: foldersError } = await supabase
    .from("folders")
    .select("id, name")
    .order("name", { ascending: true });

  if (foldersError) {
    throw new Error(foldersError.message);
  }

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, title, file_name, folder, created_at")
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const { data: folderLinks, error: folderLinksError } = await supabase
    .from("folder_links")
    .select("id, title, url, folder, created_at")
    .order("created_at", { ascending: false });

  if (folderLinksError) {
    throw new Error(folderLinksError.message);
  }

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const filteredUsers = (users || []).filter((person) => {
    if (!userQuery) return true;

    return (
      (person.full_name || "").toLowerCase().includes(userQuery) ||
      (person.email || "").toLowerCase().includes(userQuery) ||
      (person.role || "").toLowerCase().includes(userQuery)
    );
  });

  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesFolder = !selectedFolder || doc.folder === selectedFolder;
    const matchesSearch =
      !docQuery ||
      doc.title.toLowerCase().includes(docQuery) ||
      doc.file_name.toLowerCase().includes(docQuery) ||
      doc.folder.toLowerCase().includes(docQuery);

    return matchesFolder && matchesSearch;
  });

  const filteredLinks = (folderLinks || []).filter((link) => {
    const matchesFolder = !selectedFolder || link.folder === selectedFolder;
    const matchesSearch =
      !linkQuery ||
      link.title.toLowerCase().includes(linkQuery) ||
      link.url.toLowerCase().includes(linkQuery) ||
      link.folder.toLowerCase().includes(linkQuery);

    return matchesFolder && matchesSearch;
  });

  const totalUsers = filteredUsers.length;
  const totalDocuments = filteredDocuments.length;
  const totalFolders = folders?.length || 0;
  const totalAdmins =
    filteredUsers.filter((person) => person.role === "admin").length || 0;

  const navItemClass =
    "block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-purple-400/40 hover:bg-white/10 hover:text-white";

  const primaryButton =
    "w-full rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:opacity-90";

  const smallPrimaryButton =
    "rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:opacity-90";

  const dangerButton =
    "rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 font-semibold text-red-200 transition hover:bg-red-500/30";

  return (
    <main className="min-h-screen bg-[#030b1d] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#081225] p-6 lg:flex lg:h-screen lg:sticky lg:top-0">
          <div className="mb-10">
            <h1 className="text-2xl font-bold">Employee Portal</h1>
            <p className="mt-2 text-sm text-gray-400">Admin Control Center</p>
          </div>

          <nav className="space-y-3 overflow-y-auto pr-2">
            <a href="#overview" className="block rounded-2xl bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90">
              Dashboard Overview
            </a>
            <a href="#search-filter" className={navItemClass}>Search & Filter</a>
            <a href="#upload-center" className={navItemClass}>Upload Documents</a>
            <a href="#link-center" className={navItemClass}>Add Links</a>
            <a href="#user-management" className={navItemClass}>Manage Users</a>
            <a href="#folder-controls" className={navItemClass}>Folder Controls</a>
            <a href="#recent-uploads" className={navItemClass}>Recent Uploads</a>
            <a href="#recent-links" className={navItemClass}>Recent Links</a>
          </nav>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">
              {profile.full_name || "Admin User"}
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
            <StatusBanner success={success} error={error} />

            <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between lg:hidden">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
                <h2 className="mt-2 text-4xl font-bold">Admin Dashboard</h2>
                <p className="mt-3 max-w-2xl text-gray-300">
                  Manage users, resources, folders, and links from one place.
                </p>
              </div>
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
                <p className="text-sm text-gray-400">Visible Users</p>
                <h3 className="mt-2 text-3xl font-bold">{totalUsers}</h3>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
                <p className="text-sm text-gray-400">Visible Documents</p>
                <h3 className="mt-2 text-3xl font-bold">{totalDocuments}</h3>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
                <p className="text-sm text-gray-400">Folders</p>
                <h3 className="mt-2 text-3xl font-bold">{totalFolders}</h3>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
                <p className="text-sm text-gray-400">Visible Admins</p>
                <h3 className="mt-2 text-3xl font-bold">{totalAdmins}</h3>
              </div>
            </section>

            <section
              id="search-filter"
              className="mb-8 scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-semibold">Search & Filter</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Search users, documents, and links. Filter documents and links by folder.
                </p>
              </div>

              <form method="GET" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <input
                  type="text"
                  name="userQ"
                  defaultValue={params.userQ || ""}
                  placeholder="Search users..."
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                />
                <input
                  type="text"
                  name="docQ"
                  defaultValue={params.docQ || ""}
                  placeholder="Search documents..."
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                />
                <input
                  type="text"
                  name="linkQ"
                  defaultValue={params.linkQ || ""}
                  placeholder="Search links..."
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                />
                <select
                  name="folder"
                  defaultValue={selectedFolder}
                  className="rounded-2xl border border-white/10 bg-[#101935] px-4 py-3 text-white outline-none focus:border-purple-400"
                >
                  <option value="" className="bg-[#101935] text-white">
                    All folders
                  </option>
                  {(folders || []).map((folder) => (
                    <option key={folder.id} value={folder.name} className="bg-[#101935] text-white">
                      {folder.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3 md:col-span-2 xl:col-span-4">
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:opacity-90"
                  >
                    Apply
                  </button>
                  <Link
                    href="/admin"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-gray-200 transition hover:bg-white/10"
                  >
                    Clear
                  </Link>
                </div>
              </form>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-1">
                <div id="folder-controls" className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">Create Folder</h3>
                  <form action={createFolder} className="space-y-4">
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Handbooks"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                    />
                    <SubmitButton pendingText="Creating..." className={primaryButton}>
                      Create Folder
                    </SubmitButton>
                  </form>
                </div>

                <div id="upload-center" className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">Upload Center</h3>
                  <form action={uploadDocument} className="space-y-4">
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="Employee Handbook"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                    />
                    <select
                      name="folder"
                      required
                      defaultValue=""
                      className="w-full rounded-2xl border border-white/10 bg-[#101935] px-4 py-3 text-white outline-none focus:border-purple-400"
                    >
                      <option value="" disabled className="bg-[#101935] text-gray-300">
                        Select a folder
                      </option>
                      {(folders || []).map((folder) => (
                        <option key={folder.id} value={folder.name} className="bg-[#101935] text-white">
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <input
                      name="file"
                      type="file"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-red-500 file:via-purple-500 file:to-blue-500 file:px-4 file:py-2 file:text-white"
                    />
                    <SubmitButton pendingText="Uploading..." className={primaryButton}>
                      Upload Document
                    </SubmitButton>
                  </form>
                </div>

                <div id="link-center" className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">Add Folder Link</h3>
                  <form action={createFolderLink} className="space-y-4">
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="Benefits Portal"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                    />
                    <input
                      name="url"
                      type="url"
                      required
                      placeholder="https://example.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
                    />
                    <select
                      name="folder"
                      required
                      defaultValue=""
                      className="w-full rounded-2xl border border-white/10 bg-[#101935] px-4 py-3 text-white outline-none focus:border-purple-400"
                    >
                      <option value="" disabled className="bg-[#101935] text-gray-300">
                        Select a folder
                      </option>
                      {(folders || []).map((folder) => (
                        <option key={folder.id} value={folder.name} className="bg-[#101935] text-white">
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <SubmitButton pendingText="Adding..." className={primaryButton}>
                      Add Link
                    </SubmitButton>
                  </form>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">Folders</h3>

                  {!folders || folders.length === 0 ? (
                    <p className="text-gray-300">No folders yet.</p>
                  ) : (
                    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                      {folders.map((folder) => (
                        <div key={folder.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-3 text-sm font-semibold text-white">
                            {folder.name}
                          </p>

                          <form action={renameFolder} className="mb-3 flex flex-col gap-2">
                            <input type="hidden" name="folderId" value={folder.id} />
                            <input
                              name="newName"
                              type="text"
                              defaultValue={folder.name}
                              className="w-full rounded-2xl border border-white/10 bg-[#101935] px-4 py-3 text-white outline-none focus:border-purple-400"
                            />
                            <SubmitButton pendingText="Renaming..." className={smallPrimaryButton}>
                              Rename
                            </SubmitButton>
                          </form>

                          <form action={deleteFolder}>
                            <input type="hidden" name="folderId" value={folder.id} />
                            <SubmitButton pendingText="Deleting..." className={`w-full ${dangerButton}`}>
                              Delete Folder
                            </SubmitButton>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 xl:col-span-2">
                <div id="user-management" className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">User Management</h3>

                  {filteredUsers.length === 0 ? (
                    <p className="text-gray-300">No matching users found.</p>
                  ) : (
                    <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                      {filteredUsers.map((person) => (
                        <div
                          key={person.id}
                          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {person.full_name || "Unnamed User"}
                            </h4>
                            <p className="mt-1 text-sm text-gray-300">{person.email}</p>
                            <p className="text-sm text-gray-400">
                              Current role: {person.role}
                            </p>
                          </div>

                          <form action={updateUserRole} className="flex items-center gap-3">
                            <input type="hidden" name="userId" value={person.id} />
                            <select
                              name="role"
                              defaultValue={person.role}
                              className="rounded-2xl border border-white/10 bg-[#101935] px-4 py-3 text-white outline-none focus:border-purple-400"
                            >
                              <option value="employee" className="bg-[#101935] text-white">
                                employee
                              </option>
                              <option value="admin" className="bg-[#101935] text-white">
                                admin
                              </option>
                            </select>
                            <SubmitButton pendingText="Saving..." className={smallPrimaryButton}>
                              Save
                            </SubmitButton>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div id="recent-uploads" className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">Recent Uploads</h3>

                  {filteredDocuments.length === 0 ? (
                    <p className="text-gray-300">No matching documents found.</p>
                  ) : (
                    <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {doc.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-300">
                              File: {doc.file_name}
                            </p>
                            <p className="text-sm text-gray-300">
                              Folder: {doc.folder}
                            </p>
                            <p className="text-sm text-gray-400">
                              Uploaded: {new Date(doc.created_at).toLocaleString()}
                            </p>
                          </div>

                          <form action={deleteDocument}>
                            <input type="hidden" name="documentId" value={doc.id} />
                            <SubmitButton pendingText="Deleting..." className={dangerButton}>
                              Delete
                            </SubmitButton>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div id="recent-links" className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0b1635]/90 p-6 shadow-xl backdrop-blur">
                  <h3 className="mb-4 text-2xl font-semibold">Recent Links</h3>

                  {filteredLinks.length === 0 ? (
                    <p className="text-gray-300">No matching links found.</p>
                  ) : (
                    <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                      {filteredLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {link.title}
                            </h4>
                            <p className="mt-1 break-all text-sm text-gray-300">
                              {link.url}
                            </p>
                            <p className="text-sm text-gray-300">
                              Folder: {link.folder}
                            </p>
                            <p className="text-sm text-gray-400">
                              Added: {new Date(link.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-200 transition hover:bg-white/10"
                            >
                              Open
                            </a>

                            <form action={deleteFolderLink}>
                              <input type="hidden" name="linkId" value={link.id} />
                              <SubmitButton pendingText="Deleting..." className={dangerButton}>
                                Delete
                              </SubmitButton>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}