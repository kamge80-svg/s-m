export function ProductCardSkeleton() {
  return (
    <div className="relative w-full h-screen snap-start snap-always flex-shrink-0 bg-black animate-pulse">
      <div className="w-full h-full bg-slate-800" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-700" />
              <div className="h-4 w-24 bg-slate-700 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-slate-700 rounded mb-2" />
            <div className="h-4 w-1/2 bg-slate-700 rounded" />
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-slate-700" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-200 mb-4" />
        <div className="h-6 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-100 rounded-xl p-3 h-16" />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-slate-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-full bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="aspect-square bg-slate-200 rounded-lg" />
      ))}
    </div>
  );
}
