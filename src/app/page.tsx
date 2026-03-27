export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <h1 className="text-4xl font-bold text-white">
          Welcome to the Employee Portal
        </h1>
        <p className="mt-3 text-lg text-slate-200">
          Access files, manage documents, and stay connected.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#07163d] p-5 shadow-lg">
          <h2 className="text-2xl font-bold text-white">Uploads</h2>
          <p className="mt-3 text-base text-slate-200">
            Upload and manage employee files.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07163d] p-5 shadow-lg">
          <h2 className="text-2xl font-bold text-white">Downloads</h2>
          <p className="mt-3 text-base text-slate-200">
            Quickly access saved company documents.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07163d] p-5 shadow-lg">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="mt-3 text-base text-slate-200">
            View important portal activity in one place.
          </p>
        </div>
      </section>
    </div>
  );
}