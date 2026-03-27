import { RequestForm } from "@/components/request-form";

type FileItem = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
};

type LinkItem = {
  id: string;
  title: string;
  url: string;
};

type Folder = {
  id: string;
  name: string;
  files?: FileItem[];
  links?: LinkItem[];
};

export function FolderList({ folders, isAdmin }: { folders: Folder[]; isAdmin: boolean }) {
  return (
    <section className="space-y-4">
      {folders.map((folder) => (
        <div key={folder.id} className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{folder.name}</h2>
              <p className="text-sm text-slate-500">
                {(folder.files?.length ?? 0) + (folder.links?.length ?? 0)} items
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(folder.files ?? []).map((file) => (
              <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <div>
                  <div className="font-semibold">{file.file_name}</div>
                  <div className="text-sm text-slate-500">{file.mime_type ?? "file"}</div>
                </div>

                {isAdmin ? (
                  <form action="/api/admin/files/delete" method="post">
                    <input type="hidden" name="fileId" value={file.id} />
                    <button className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
                      Remove
                    </button>
                  </form>
                ) : (
                  <RequestForm targetType="file" targetId={file.id} />
                )}
              </div>
            ))}

            {(folder.links ?? []).map((link) => (
              <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <div>
                  <div className="font-semibold">{link.title}</div>
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                    {link.url}
                  </a>
                </div>

                {isAdmin ? (
                  <form action="/api/admin/links" method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="linkId" value={link.id} />
                    <button className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
                      Remove
                    </button>
                  </form>
                ) : (
                  <RequestForm targetType="link" targetId={link.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}