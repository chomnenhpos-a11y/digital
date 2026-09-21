export default function PromoBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-200 p-4 md:p-10 animate-pulse">
      <div className="h-5 w-28 rounded-full bg-gray-300 mb-4" />

      <div className="h-8 w-3/4 rounded bg-gray-300" />

      <div className="mt-3 space-y-2 max-w-md">
        <div className="h-4 w-full rounded bg-gray-300" />
        <div className="h-4 w-5/6 rounded bg-gray-300" />
      </div>

      <div className="mt-6 h-10 w-32 rounded-full bg-gray-300" />
    </div>
  );
}