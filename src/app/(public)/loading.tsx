import Skeleton, { TarjetaViajeSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-lg px-lg py-lg">
      <div className="mx-auto max-w-lg space-y-sm text-center">
        <Skeleton className="mx-auto h-9 w-72" />
        <Skeleton className="mx-auto h-4 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <TarjetaViajeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
