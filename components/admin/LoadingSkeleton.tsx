export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-16 animate-pulse" /></th>
            ))}
          </tr></thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-white/5">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4">
          <div className="h-3 bg-white/10 rounded w-12 mb-3 animate-pulse" />
          <div className="h-6 bg-white/10 rounded w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
