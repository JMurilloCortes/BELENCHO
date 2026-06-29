export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 shimmer" />
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-gray-200/70" />
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-200/70" />
        <div className="absolute bottom-3 left-3 w-20 h-5 rounded-full bg-gray-200/70" />
      </div>
      <div className="p-3 sm:p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-100 rounded-lg w-20" />
          <div className="h-9 w-9 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
