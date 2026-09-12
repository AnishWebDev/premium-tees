import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <Skeleton className="mb-8 h-4 w-64" />
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
