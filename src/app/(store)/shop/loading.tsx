import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
        <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
        <div className="product-grid mt-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
