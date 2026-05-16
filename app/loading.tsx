export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#0A6CF1] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
}
