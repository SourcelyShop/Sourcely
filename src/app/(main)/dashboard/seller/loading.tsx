import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="relative min-h-screen w-full">
            <div className="max-h-screen flex flex-col items-around justify-top px-40 py-17">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <Skeleton className="h-12 w-64 mb-2" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />

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
