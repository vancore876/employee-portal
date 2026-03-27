type StatusBannerProps = {
  success?: string;
  error?: string;
};

export default function StatusBanner({
  success,
  error,
}: StatusBannerProps) {
  if (!success && !error) return null;

  if (error) {
    return (
      <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100 shadow-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100 shadow-lg">
      {success}
    </div>
  );
}