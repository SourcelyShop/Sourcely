import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header Skeleton */}
                <div className="glass-card p-8 rounded-2xl border border-white/10 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <Skeleton className="w-32 h-32 rounded-full" />

                    <div className="text-center md:text-left flex-1 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4 flex-wrap">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        <Skeleton className="h-4 w-full max-w-2xl mx-auto md:mx-0 mb-2" />
                        <Skeleton className="h-4 w-3/4 mx-auto md:mx-0 mb-6" />

                        <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-32" />
                        </div>

                        <div className="flex justify-center md:justify-start">
                            <Skeleton className="h-10 w-32 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Listings Grid Skeleton */}
                <div className="space-y-8">
                    <Skeleton className="h-8 w-64" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card rounded-xl border border-white/10 overflow-hidden h-[400px]">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex justify-between pt-4">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
