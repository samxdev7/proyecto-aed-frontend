import Skeleton, { FilaTablaSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-admin-border bg-admin-bg">
            <tr>
              {Array.from({ length: 5 }, (_, i) => (
                <th key={i} className="p-md">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <FilaTablaSkeleton columnas={5} />
        </table>
      </div>
    </div>
  );
}
