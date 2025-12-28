'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { DiscoverFilters } from "./DiscoverFilters"
import { useState } from "react"

export function MobileFilters() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-black/20 border-white/10 text-white hover:bg-white/10 hover:text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-neutral-950 border-white/10 w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                    <DiscoverFilters />
                </div>
            </SheetContent>
        </Sheet>
    )
}
